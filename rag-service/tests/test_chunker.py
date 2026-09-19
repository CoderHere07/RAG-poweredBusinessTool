from chunker import chunk_text, split_sentences


def test_split_sentences_basic():
    text = "This is one sentence. This is another. And a third!"
    sentences = split_sentences(text)
    assert len(sentences) == 3
    assert sentences[0] == "This is one sentence."


def test_split_sentences_handles_abbreviations():
    text = "Dr. Smith went to Inc. headquarters. He met Mr. Jones there."
    sentences = split_sentences(text)
    # Should NOT split on "Dr." or "Inc." or "Mr." — only 2 real sentences.
    assert len(sentences) == 2


def test_chunk_text_respects_size_limit():
    text = "Sentence one. " * 200   # long enough to force multiple chunks
    chunks = chunk_text(text, chunk_size=100, overlap=20)
    assert len(chunks) > 1
    for chunk in chunks:
        # Allow slight overflow since we don't split mid-sentence, but not by a huge margin.
        assert len(chunk) < 150


def test_chunk_text_carries_overlap():
    text = "First sentence here. Second sentence here. Third sentence here. Fourth sentence here."
    chunks = chunk_text(text, chunk_size=40, overlap=15)
    assert len(chunks) >= 2
    # The tail of chunk N should reappear at the start of chunk N+1.
    overlap_text = chunks[0][-10:]
    assert overlap_text in chunks[1]


def test_chunk_text_handles_empty_string():
    assert chunk_text("") == []


def test_chunk_text_handles_single_short_sentence():
    chunks = chunk_text("Just one short sentence.")
    assert len(chunks) == 1


def test_chunk_text_hard_splits_oversized_sentence():
    huge_sentence = "word " * 500 + "."   # one absurdly long "sentence"
    chunks = chunk_text(huge_sentence, chunk_size=100, overlap=10)
    assert len(chunks) > 1   # must be split even though it's technically one sentence