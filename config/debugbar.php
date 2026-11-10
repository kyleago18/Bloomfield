<?php

declare(strict_types=1);

return [

    /*
     |--------------------------------------------------------------------------
     | Debugbar Settings
     |--------------------------------------------------------------------------
     |
     | Debugbar is enabled by default, when debug is set to true in app.php.
     | You can override the value by setting enable to true or false instead of null.
     |
     | You can provide an array of URI's that must be ignored (eg. 'api/*')
     |
     */

    'enabled' => env('DEBUGBAR_ENABLED'),
    'collect_jobs' => env('DEBUGBAR_COLLECT_JOBS', false),
    'except' => [
        'telescope*',
        'horizon*',
        '_boost/browser-logs',
        'livewire-*/livewire.js',
    ],

    /*
    |--------------------------------------------------------------------------
    | DataCollectors
    |--------------------------------------------------------------------------
    |
    | Enable/disable DataCollectors
    |
    */

    'collectors' => [
        'phpinfo'         => env('DEBUGBAR_COLLECTORS_PHPINFO', false),         // Php version
        'messages'        => env('DEBUGBAR_COLLECTORS_MESSAGES', true),         // Messages
        'time'            => env('DEBUGBAR_COLLECTORS_TIME', true),             // Time Datalogger
        'memory'          => env('DEBUGBAR_COLLECTORS_MEMORY', true),           // Memory usage
        'exceptions'      => env('DEBUGBAR_COLLECTORS_EXCEPTIONS', true),       // Exception displayer
        'log'             => env('DEBUGBAR_COLLECTORS_LOG', true),              // Logs from Monolog (merged in messages if enabled)
        'db'              => env('DEBUGBAR_COLLECTORS_DB', true),               // Show database (PDO) queries and bindings
        'views'           => env('DEBUGBAR_COLLECTORS_VIEWS', true),            // Views with their data
        'route'           => env('DEBUGBAR_COLLECTORS_ROUTE', false),           // Current route information
        'auth'            => env('DEBUGBAR_COLLECTORS_AUTH', false),            // Display Laravel authentication status
        'gate'            => env('DEBUGBAR_COLLECTORS_GATE', true),             // Display Laravel Gate checks
        'session'         => env('DEBUGBAR_COLLECTORS_SESSION', false),         // Display session data
        'symfony_request' => env('DEBUGBAR_COLLECTORS_SYMFONY_REQUEST', true),  // Default Request Data
        'mail'            => env('DEBUGBAR_COLLECTORS_MAIL', true),             // Catch mail messages
        'laravel'         => env('DEBUGBAR_COLLECTORS_LARAVEL', true),          // Laravel version and environment
        'events'          => env('DEBUGBAR_COLLECTORS_EVENTS', false),          // All events fired
        'logs'            => env('DEBUGBAR_COLLECTORS_LOGS', false),            // Add the latest log messages
        'config'          => env('DEBUGBAR_COLLECTORS_CONFIG', false),          // Display config settings
        'cache'           => env('DEBUGBAR_COLLECTORS_CACHE', true),            // Display cache events
        'models'          => env('DEBUGBAR_COLLECTORS_MODELS', true),           // Display models
        'livewire'        => env('DEBUGBAR_COLLECTORS_LIVEWIRE', true),         // Display Livewire (when available)
        'inertia'         => env('DEBUGBAR_COLLECTORS_INERTIA', true),          // Display Inertia (when available)
        'jobs'            => env('DEBUGBAR_COLLECTORS_JOBS', true),             // Display dispatched jobs
        'pennant'         => env('DEBUGBAR_COLLECTORS_PENNANT', true),          // Display Pennant feature flags
        'ai'              => env('DEBUGBAR_COLLECTORS_AI', true),               // Display laravel/ai agent runs
        'http_client'     => env('DEBUGBAR_COLLECTORS_HTTP_CLIENT', true),      // Display HTTP Client requests
    ],

    /*
     |--------------------------------------------------------------------------
     | Extra options
     |--------------------------------------------------------------------------
     |
     | Configure some DataCollectors
     |
     */

    'options' => [
        'time' => [
            'memory_usage' => env('DEBUGBAR_OPTIONS_TIME_MEMORY_USAGE', false), // Calculated by subtracting memory start and end, it may be inaccurate
        ],
        'messages' => [
            'trace' => env('DEBUGBAR_OPTIONS_MESSAGES_TRACE', true),                  // Trace the origin of the debug message
            'backtrace_exclude_paths' => [],                                                      // Paths to exclude from backtrace. (in addition to defaults)
            'capture_dumps' => env('DEBUGBAR_OPTIONS_MESSAGES_CAPTURE_DUMPS', false), // Capture laravel `dump();` as message
            'timeline' => env('DEBUGBAR_OPTIONS_MESSAGES_TIMELINE', true),            // Add messages to the timeline
        ],
        'memory' => [
            'reset_peak' => env('DEBUGBAR_OPTIONS_MEMORY_RESET_PEAK', false),       // run memory_reset_peak_usage before collecting
            'with_baseline' => env('DEBUGBAR_OPTIONS_MEMORY_WITH_BASELINE', false), // Set boot memory usage as memory peak baseline
            'precision' => (int) env('DEBUGBAR_OPTIONS_MEMORY_PRECISION', 0),       // Memory rounding precision
        ],
        'auth' => [
            'show_name' => env('DEBUGBAR_OPTIONS_AUTH_SHOW_NAME', true),     // Also show the users name/email in the debugbar
            'show_guards' => env('DEBUGBAR_OPTIONS_AUTH_SHOW_GUARDS', true), // Show the guards that are used
        ],
        'gate' => [
            'trace' => false,      // Trace the origin of the Gate checks
            'timeline' => env('DEBUGBAR_OPTIONS_GATE_TIMELINE', false),      // Add mails to the timeline
        ],
        'db' => [
            'with_params'       => env('DEBUGBAR_OPTIONS_WITH_PARAMS', true),   // Render SQL with the parameters substituted
            'exclude_paths'     => [       // Paths to exclude entirely from the collector
                //'vendor/laravel/framework/src/Illuminate/Session', // Exclude sessions queries
            ],
            'backtrace'         => env('DEBUGBAR_OPTIONS_DB_BACKTRACE', true),   // Use a backtrace to find the origin of the query in your files.
            'backtrace_exclude_paths' => [],   // Paths to exclude from backtrace. (in addition to defaults)
            'backtrace_editor_links' => env('DEBUGBAR_OPTIONS_DB_BACKTRACE_EDITOR_LINKS', false), // Add editor links to backtrace entries (non-vendor files only)
            'timeline'          => env('DEBUGBAR_OPTIONS_DB_TIMELINE', false),  // Add the queries to the timeline
            'duration_background'  => env('DEBUGBAR_OPTIONS_DB_DURATION_BACKGROUND', true),   // Show shaded background on each query relative to how long it took to execute.
            'explain'           => env('DEBUGBAR_OPTIONS_DB_EXPLAIN_ENABLED', true), // Show EXPLAIN output on queries
            'show_query_result' => env('DEBUGBAR_OPTIONS_DB_SHOW_QUERY_RESULT', false), // Show option to re-run SELECT queries and show the result
            'only_slow_queries' => env('DEBUGBAR_OPTIONS_DB_ONLY_SLOW_QUERIES', true), // Only track queries that last longer than `slow_threshold`
            'slow_threshold'    => env('DEBUGBAR_OPTIONS_DB_SLOW_THRESHOLD', false), // Max query execution time (ms). Exceeding queries will be highlighted
            'memory_usage'      => env('DEBUGBAR_OPTIONS_DB_MEMORY_USAGE', false),   // Show queries memory usage
            'soft_limit'       => (int) env('DEBUGBAR_OPTIONS_DB_SOFT_LIMIT', 100),  // After the soft limit, no parameters/backtrace are captured
            'hard_limit'       => (int) env('DEBUGBAR_OPTIONS_DB_HARD_LIMIT', 500),  // After the hard limit, queries are ignored
        ],
        'mail' => [
            'timeline' => env('DEBUGBAR_OPTIONS_MAIL_TIMELINE', true),  // Add mails to the timeline
            'show_body' => env('DEBUGBAR_OPTIONS_MAIL_SHOW_BODY', true),
        ],
        'views' => [
            'timeline' => env('DEBUGBAR_OPTIONS_VIEWS_TIMELINE', true),                  // Add the views to the timeline
            'data' => env('DEBUGBAR_OPTIONS_VIEWS_DATA', false),                         // True for all data, 'keys' for only names, false for no parameters.
            'group' => (int) env('DEBUGBAR_OPTIONS_VIEWS_GROUP', 50),                    // Group duplicate views. Pass value to auto-group, or true/false to force
            'exclude_paths' => [    // Add the paths which you don't want to appear in the views
                'vendor/filament',   // Exclude Filament components by default
            ],
        ],
        'inertia' => [
            'pages' => env('DEBUGBAR_OPTIONS_VIEWS_INERTIA_PAGES', 'js/Pages'),  // Path for Inertia views
        ],
        'route' => [
            'label' => env('DEBUGBAR_OPTIONS_ROUTE_LABEL', true),  // Show complete route on bar
        ],
        'session' => [
            'masked' => [], // List of keys that are masked
        ],
        'symfony_request' => [
            'label' => env('DEBUGBAR_OPTIONS_SYMFONY_REQUEST_LABEL', true),  // Show route on bar
            'masked' => [], // List of keys that are masked
        ],
        'events' => [
            'data' => env('DEBUGBAR_OPTIONS_EVENTS_DATA', false), // Collect events data
            'listeners' => env('DEBUGBAR_OPTIONS_EVENTS_LISTENERS', false), // Add listeners to the events data
        ],
        'logs' => [
            'file' => env('DEBUGBAR_OPTIONS_LOGS_FILE'),
        ],
        'config' => [
            'masked' => [],
        ],
        'cache' => [
            'values' => env('DEBUGBAR_OPTIONS_CACHE_VALUES', true), // Collect cache values
            'timeline' => env('DEBUGBAR_OPTIONS_CACHE_TIMELINE', false),  // Add cache events to the timeline
        ],
        'http_client' => [
            'masked' => [],
            'timeline' => env('DEBUGBAR_OPTIONS_HTTP_CLIENT_TIMELINE', true),  // Add requests to the timeline
        ],
        'ai' => [
            'values' => env('DEBUGBAR_OPTIONS_AI_VALUES', true), // Collect prompt/response/tool bodies
        ],
    ],

    /*
     |--------------------------------------------------------------------------
     | Custom DataCollectors
     |--------------------------------------------------------------------------
     */
    'custom_collectors' => [],

    /*
    |--------------------------------------------------------------------------
    | Editor
    |--------------------------------------------------------------------------
    */
    'editor' => env('DEBUGBAR_EDITOR') ?: env('IGNITION_EDITOR', 'phpstorm'),

    /*
    |--------------------------------------------------------------------------
    | Capture Ajax Requests
    |--------------------------------------------------------------------------
    */
    'capture_ajax' => env('DEBUGBAR_CAPTURE_AJAX', true),
    'add_ajax_timing' => env('DEBUGBAR_ADD_AJAX_TIMING', false),
    'ajax_handler_auto_show' => env('DEBUGBAR_AJAX_HANDLER_AUTO_SHOW', true),
    'ajax_handler_enable_tab' => env('DEBUGBAR_AJAX_HANDLER_ENABLE_TAB', true),
    'capture_streamed' => env('DEBUGBAR_CAPTURE_STREAMED', false),
    'streamed_content_types' => ['text/event-stream'],
    'defer_datasets' => env('DEBUGBAR_DEFER_DATASETS', false),

    /*
    |--------------------------------------------------------------------------
    | Remote Path Mapping
    |--------------------------------------------------------------------------
    */
    'remote_sites_path' => env('DEBUGBAR_REMOTE_SITES_PATH'),
    'local_sites_path' => env('DEBUGBAR_LOCAL_SITES_PATH', env('IGNITION_LOCAL_SITES_PATH')),

    /*
    |--------------------------------------------------------------------------
    | Storage settings
    |--------------------------------------------------------------------------
    */
    'storage' => [
        'enabled'    => env('DEBUGBAR_STORAGE_ENABLED', true),
        'open'       => env('DEBUGBAR_OPEN_STORAGE'),
        'driver'     => env('DEBUGBAR_STORAGE_DRIVER', 'file'),
        'path'       => env('DEBUGBAR_STORAGE_PATH', storage_path('debugbar')),
        'connection' => env('DEBUGBAR_STORAGE_CONNECTION'),
        'provider'   => env('DEBUGBAR_STORAGE_PROVIDER', ''),
    ],

    'force_allow_enable' => env('DEBUGBAR_FORCE_ALLOW_ENABLE', false),
    'use_dist_files' => env('DEBUGBAR_USE_DIST_FILES', true),
    'include_vendors' => env('DEBUGBAR_INCLUDE_VENDORS', true),
    'error_handler' => env('DEBUGBAR_ERROR_HANDLER', false),
    'error_level' => env('DEBUGBAR_ERROR_LEVEL', E_ALL),
    'clockwork' => env('DEBUGBAR_CLOCKWORK', false),
    'inject' => env('DEBUGBAR_INJECT', true),
    'route_prefix' => env('DEBUGBAR_ROUTE_PREFIX', '_debugbar'),
    'route_middleware' => [],
    'route_domain' => env('DEBUGBAR_ROUTE_DOMAIN'),
    'theme' => env('DEBUGBAR_THEME', 'auto'),
    'debug_backtrace_limit' => (int) env('DEBUGBAR_DEBUG_BACKTRACE_LIMIT', 50),
];
