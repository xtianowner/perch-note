use tauri_plugin_sql::{Migration, MigrationKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // NOTE: migration v1's SQL string is kept byte-identical to its first
    // shipped form (commit f17c9ff). Do not reformat or re-indent the lines
    // inside the v1 string literal — sqlx hashes the exact bytes and any
    // whitespace change triggers "migration N was previously applied but
    // has been modified" on user databases.
    let migrations = vec![
        Migration {
            version: 1,
            description: "create_entries_table",
            sql: "CREATE TABLE IF NOT EXISTS entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                pinned INTEGER NOT NULL DEFAULT 0,
                deleted_at INTEGER
              );
              CREATE INDEX IF NOT EXISTS idx_entries_created ON entries(created_at DESC);
              CREATE INDEX IF NOT EXISTS idx_entries_active ON entries(deleted_at);",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "add_title_column",
            sql: "ALTER TABLE entries ADD COLUMN title TEXT NOT NULL DEFAULT '';",
            kind: MigrationKind::Up,
        },
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:perch.db", migrations)
                .build(),
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
