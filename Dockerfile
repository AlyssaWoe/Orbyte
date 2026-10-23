# Orbyte RunPod Serverless Worker Dockerfile
# Automatically detected by RunPod GitHub integration at repository root

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

# Install tesseract-ocr system package for OCR document extraction
RUN apt-get update \
    && apt-get install -y --no-install-recommends tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /worker

# Install worker dependencies
COPY runpod/requirements.txt ./
RUN python -m pip install --upgrade pip \
    && python -m pip install -r requirements.txt

# Copy worker execution handler
COPY runpod/handler.py ./

# RunPod serverless worker entrypoint
CMD ["python", "-u", "handler.py"]
