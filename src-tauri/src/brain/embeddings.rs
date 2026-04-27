//! Layer D embedding interface. Real implementation lives behind the
//! `semantic` feature flag (ort + MiniLM). The default build ships a
//! trait so the rest of the codebase compiles and we can swap in the
//! real engine in Phase 7.

use anyhow::Result;

pub trait Embedder: Send + Sync {
    fn embed(&self, text: &str) -> Result<Vec<f32>>;
    fn dim(&self) -> usize;
    fn model_name(&self) -> &'static str;
}

/// No-op embedder: returns an empty vector. Used when the `semantic`
/// feature is disabled, so callers can branch on `dim() == 0`.
pub struct NullEmbedder;

impl Embedder for NullEmbedder {
    fn embed(&self, _text: &str) -> Result<Vec<f32>> {
        Ok(Vec::new())
    }
    fn dim(&self) -> usize {
        0
    }
    fn model_name(&self) -> &'static str {
        "null"
    }
}

#[cfg(feature = "semantic")]
pub mod minilm {
    //! MiniLM-L6-v2 via ONNX Runtime. ~80 MB model, 384-dim output.
    //! Loaded lazily on first embed call.

    use super::*;

    pub struct MiniLmEmbedder {
        // Placeholder — real impl will hold a `Session` and a `Tokenizer`.
    }

    impl MiniLmEmbedder {
        pub fn load(_model_path: &std::path::Path, _vocab_path: &std::path::Path) -> Result<Self> {
            anyhow::bail!("semantic feature enabled but MiniLM loader is still a stub")
        }
    }

    impl Embedder for MiniLmEmbedder {
        fn embed(&self, _text: &str) -> Result<Vec<f32>> {
            anyhow::bail!("MiniLM embed not implemented")
        }
        fn dim(&self) -> usize {
            384
        }
        fn model_name(&self) -> &'static str {
            "all-MiniLM-L6-v2"
        }
    }
}
