<?php

namespace App\Services;

use Firebase\JWT\JWT;
use GuzzleHttp\Client;

class FirestoreService
{
    private Client $client;
    private string $baseUrl;

    public function __construct()
    {
        $credentials  = json_decode(file_get_contents(config('firebase.credentials')), true);
        $projectId    = $credentials['project_id'];
        $accessToken  = $this->getAccessToken($credentials);

        $this->client  = new Client(['headers' => ['Authorization' => "Bearer {$accessToken}"]]);
        $this->baseUrl = "https://firestore.googleapis.com/v1/projects/{$projectId}/databases/(default)/documents/";
    }

    private function getAccessToken(array $credentials): string
    {
        $now = time();
        $jwt = JWT::encode([
            'iss'   => $credentials['client_email'],
            'scope' => 'https://www.googleapis.com/auth/datastore',
            'aud'   => 'https://oauth2.googleapis.com/token',
            'exp'   => $now + 3600,
            'iat'   => $now,
        ], $credentials['private_key'], 'RS256');

        $response = (new Client())->post('https://oauth2.googleapis.com/token', [
            'form_params' => [
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion'  => $jwt,
            ],
        ]);

        return json_decode($response->getBody(), true)['access_token'];
    }

    public function runQuery(string $parent, string $collectionId, array $orderBy = [], array $where = []): array
    {
        $query = ['from' => [['collectionId' => $collectionId]]];

        if (!empty($where)) {
            $query['where'] = ['fieldFilter' => [
                'field' => ['fieldPath' => $where['field']],
                'op'    => $where['op'],
                'value' => $this->encodeValue($where['value']),
            ]];
        }

        if (!empty($orderBy)) {
            $query['orderBy'] = array_map(fn($o) => [
                'field'     => ['fieldPath' => $o['field']],
                'direction' => $o['direction'] ?? 'ASCENDING',
            ], $orderBy);
        }

        $url      = $this->baseUrl . "{$parent}:runQuery";
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
        return basename(json_decode($response->getBody(), true)['name']);
    }

    public function setDocument(string $path, array $data, bool $merge = false): void
    {
        $url = $this->baseUrl . $path;
        if ($merge) {
            $url .= '?' . implode('&', array_map(fn($k) => "updateMask.fieldPaths={$k}", array_keys($data)));
        }
        $this->client->patch($url, ['json' => ['fields' => $this->encodeDocument($data)]]);
    }

    public function deleteDocument(string $path): void
    {
        $this->client->delete($this->baseUrl . $path);
    }

    private function encodeDocument(array $data): array
    {
        return array_combine(array_keys($data), array_map(fn($v) => $this->encodeValue($v), $data));
    }

    private function encodeValue(mixed $value): array
    {
        return match (true) {
            is_null($value)  => ['nullValue' => null],
            is_bool($value)  => ['booleanValue' => $value],
            is_int($value)   => ['integerValue' => (string) $value],
            is_float($value) => ['doubleValue' => $value],
            is_array($value) => ['mapValue' => ['fields' => $this->encodeDocument($value)]],
            default          => ['stringValue' => (string) $value],
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
            isset($value['mapValue'])     => array_map(fn($v) => $this->decodeValue($v), $value['mapValue']['fields'] ?? []),
            default                       => null,
        };
    }
}
