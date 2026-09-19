import pytest

from config import settings
from store import query_chunks


@pytest.fixture(autouse=True)
def reset_threshold():
    """Ensure tests don't leak a modified threshold into each other."""
    original = settings.relevance_threshold
    yield
    settings.relevance_threshold = original


def test_query_chunks_filters_by_threshold(monkeypatch):
    # Mock the underlying collection.query to return known distances,
    # so this test doesn't depend on a real embedded document existing.
    class FakeCollection:
        def query(self, query_embeddings, n_results, where=None):
            return {
                "documents": [["relevant chunk", "irrelevant chunk"]],
                "metadatas": [[{"source": "a.pdf", "page": 1}, {"source": "a.pdf", "page": 2}]],
                "distances": [[0.3, 0.95]],   # one clearly relevant, one clearly not
            }

    import store
    monkeypatch.setattr(store, "_collection", FakeCollection())
    monkeypatch.setattr(store, "embed", lambda texts: [[0.0]] * len(texts))

    settings.relevance_threshold = 0.65
    results = query_chunks("any question")

    assert len(results) == 1
    assert results[0]["text"] == "relevant chunk"


def test_query_chunks_returns_empty_when_nothing_relevant(monkeypatch):
    class FakeCollection:
        def query(self, query_embeddings, n_results, where=None):
            return {
                "documents": [["irrelevant chunk"]],
                "metadatas": [[{"source": "a.pdf", "page": 1}]],
                "distances": [[0.99]],
            }

    import store
    monkeypatch.setattr(store, "_collection", FakeCollection())
    monkeypatch.setattr(store, "embed", lambda texts: [[0.0]] * len(texts))

    settings.relevance_threshold = 0.65
    results = query_chunks("any question")

    assert results == []