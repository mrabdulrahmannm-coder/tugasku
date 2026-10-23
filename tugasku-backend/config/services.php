<?php

return [
    'polibatam' => [
        'client_id' => env('POLIBATAM_SSO_CLIENT_ID'),
        'client_secret' => env('POLIBATAM_SSO_CLIENT_SECRET'),
        'redirect_uri' => env('POLIBATAM_SSO_REDIRECT_URI', 'http://localhost:5173/sso/callback'),
        'sso_url' => env('POLIBATAM_SSO_BASE_URL', 'https://sso.polibatam.ac.id'),
    ],
];