# Orbyte RunPod serverless worker
#
# Build from the repo root with this directory as the context:
#     docker build -t <registry>/orbyte-runpod:1.0.0 runpod/
#
# The image contains the worker and the model runtime. It does NOT contain the
# Orbyte application — the app stays on Render/localhost and reaches this over
# HTTPS.
#
# The base is RunPod's own CUDA image so the driver version matches their host
# fleet. Substituting a plain nvidia/cuda base here is the most common reason a
# worker builds fine and then dies at container start with no logs.
FROM runpod/base:0.6.2-cuda12.1.0

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    HF_HOME=/runpod-volume/huggingface \
    TRANSFORMERS_CACHE=/runpod-volume/huggingface \
    TOKENIZERS_PARALLELISM=false \
    USE_VLLM=0 \
    MAX_PROMPT_CHARS=24000 \
    MAX_FILE_BYTES=12582912

# tesseract is an OS package, not a pip one. Without it pytesseract imports
# successfully and then fails at call time, which handler.py reports as
# tesseract unavailable — correct, but better to just ship the binary.
RUN apt-get update \
    && apt-get install -y --no-install-recommends tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /worker

COPY requirements.txt ./
RUN python -m pip install --upgrade pip \
    && python -m pip install -r requirements.txt

COPY handler.py ./

# RunPod injects the job protocol over stdin/stdout. Anything printed to stdout
# that is not JSON corrupts it, so handler.py never prints log lines.
CMD ["python", "-u", "handler.py"]