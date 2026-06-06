<?php

namespace App\Services;

use Google\Auth\Credentials\ServiceAccountCredentials;
use Google\Auth\Middleware\AuthTokenMiddleware;
use GuzzleHttp\Client;
use GuzzleHttp\HandlerStack;

class FirestoreService
{
    private Client $client;
    private string $baseUrl;

    public function __construct()
    {
        $credentialsPath = config('firebase.credentials');
        $credentials = json_decode(file_get_contents($credentialsPath), true);
        $projectId = $credentials['project_id'];

        $serviceAccount = new ServiceAccountCredentials(
            'https://www.googleapis.com/auth/datastore',
            $credentials
        );

        $stack = HandlerStack::create();
        $stack->push(new AuthTokenMiddleware($serviceAccount));

        $this->client = new Client(['handler' => $stack, 'auth' => 'google_auth']);
        $this->baseUrl = "https://firestore.googleapis.com/v1/projects/{$projectId}/databases/(default)/documents/";
    }

    public function listDocuments(string $path): array
    {
        $response = $this->client->get($this->baseUrl . $path);
        $data = json_decode($response->getBody(), true);

        return array_map(
            fn($doc) => $this->parseDocument($doc),
            $data['documents'] ?? []
        );
    }

    public function runQuery(string $parent, string $collectionId, array $orderBy = [], array $where = []): array
    {
        $query = ['from' => [['collectionId' => $collectionId]]];

        if (!empty($where)) {
            $query['where'] = [
                'fieldFilter' => [
                    'field' => ['fieldPath' => $where['field']],
                    'op'    => $where['op'],
                    'value' => $this->encodeValue($where['value']),
                ],
            ];
        }

        if (!empty($orderBy)) {
            $query['orderBy'] = array_map(fn($o) => [
                'field'     => ['fieldPath' => $o['field']],
                'direction' => $o['direction'] ?? 'ASCENDING',
            ], $orderBy);
        }

        $url = "https://firestore.googleapis.com/v1/projects/" .
               explode('projects/', $this->baseUrl)[1];
        $url = str_replace('/documents/', "/documents/{$parent}:runQuery", $this->baseUrl);

        $response = $this->client->post($url, ['json' => ['structuredQuery' => $query]]);
        $results  = json_decode($response->getBody(), true);

        $docs = [];
        foreach ($results as $result) {
            if (isset($result['document'])) {
                $docs[] = $this->parseDocument($result['document']);
            }
        }
        return $docs;
    }

    public function getDocument(string $path): ?array
    {
        try {
            $response = $this->client->get($this->baseUrl . $path);
            return $this->parseDocument(json_decode($response->getBody(), true));
        } catch (\Exception) {
            return null;
        }
    }

    public function addDocument(string $path, array $data): string
    {
        $response = $this->client->post($this->baseUrl . $path, [
            'json' => ['fields' => $this->encodeDocument($data)],
        ]);
        $doc = json_decode($response->getBody(), true);
        return basename($doc['name']);
    }

    public function setDocument(string $path, array $data, bool $merge = false): void
    {
        $url = $this->baseUrl . $path;

        if ($merge) {
            $mask = implode('&', array_map(fn($k) => "updateMask.fieldPaths={$k}", array_keys($data)));
            $url .= '?' . $mask;
        }

        $this->client->patch($url, [
            'json' => ['fields' => $this->encodeDocument($data)],
        ]);
    }

    public function deleteDocument(string $path): void
    {
        $this->client->delete($this->baseUrl . $path);
    }

    private function encodeDocument(array $data): array
    {
        $fields = [];
        foreach ($data as $key => $value) {
            $fields[$key] = $this->encodeValue($value);
        }
        return $fields;
    }

    private function encodeValue(mixed $value): array
    {
        return match (true) {
            is_null($value)   => ['nullValue' => null],
            is_bool($value)   => ['booleanValue' => $value],
            is_int($value)    => ['integerValue' => (string) $value],
            is_float($value)  => ['doubleValue' => $value],
            is_array($value)  => ['mapValue' => ['fields' => $this->encodeDocument($value)]],
            default           => ['stringValue' => (string) $value],
        };
    }

    private function parseDocument(array $doc): array
    {
        $data = ['id' => basename($doc['name'])];
        foreach ($doc['fields'] ?? [] as $key => $value) {
            $data[$key] = $this->decodeValue($value);
        }
        return $data;
    }

    private function decodeValue(array $value): mixed
    {
        return match (true) {
            isset($value['stringValue'])  => $value['stringValue'],
            isset($value['integerValue']) => (int) $value['integerValue'],
            isset($value['doubleValue'])  => (float) $value['doubleValue'],
            isset($value['booleanValue']) => $value['booleanValue'],
            isset($value['nullValue'])    => null,
            isset($value['mapValue'])     => array_map(
                fn($v) => $this->decodeValue($v),
                $value['mapValue']['fields'] ?? []
            ),
            default => null,
        };
    }
}
