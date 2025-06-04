FROM ghcr.io/ggml-org/llama.cpp:server-cuda-b5581

ADD https://huggingface.co/openbmb/MiniCPM-o-2_6-gguf/resolve/main/Model-7.6B-Q4_K_M.gguf?download=true \
  /models/openbmb/MiniCPM-o-2_6-gguf/Model-7.6B-Q4_K_M.gguf
ADD https://huggingface.co/openbmb/MiniCPM-o-2_6-gguf/resolve/main/mmproj-model-f16.gguf?download=true \
  /models/openbmb/MiniCPM-o-2_6-gguf/mmproj-model-f16.gguf

CMD [ \
  "--host", "0.0.0.0", \
  "--mmproj", "/models/openbmb/MiniCPM-o-2_6-gguf/mmproj-model-f16.gguf" \
  "--model", "/models/openbmb/MiniCPM-o-2_6-gguf/Model-7.6B-Q4_K_M.gguf" \
  "--port", "8000", \
]
