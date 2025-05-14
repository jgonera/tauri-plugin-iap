use tauri_plugin_sql::{Migration, MigrationKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: "
                CREATE TABLE IF NOT EXISTS doc (
                    created_at TEXT NOT NULL,
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    page_count INTEGER DEFAULT 0,
                    updated_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS page (
                    created_at TEXT NOT NULL,
                    doc_id TEXT NOT NULL,
                    id TEXT PRIMARY KEY,
                    position INTEGER NOT NULL,
                    text TEXT,
                    updated_at TEXT NOT NULL,

                    FOREIGN KEY(doc_id) REFERENCES doc(id)
                );

                CREATE INDEX IF NOT EXISTS idx_doc_created_at ON doc(created_at);
                CREATE INDEX IF NOT EXISTS idx_doc_name ON doc(name);
                CREATE INDEX IF NOT EXISTS idx_doc_updated_at ON doc(updated_at);
                CREATE INDEX IF NOT EXISTS idx_page_text ON page(text);
                CREATE UNIQUE INDEX IF NOT EXISTS idx_page_id_position ON page(id, position);
            ",
            kind: MigrationKind::Up,
        }
    ];

    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::new()
            .add_migrations("sqlite:scribbleScan.db", migrations)
            .build()
        )
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_sharesheet::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
