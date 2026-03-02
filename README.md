TrueBG AI

TrueBG AI is a web application that removes image backgrounds using the RMBG-1.4 model in ONNX format running locally on the server.

Upload an image and get the same image with the background removed — ready to download in seconds.

Steps to start the app:

# Download the Model

1. Download the ONNX model from briaai/RMBG-1.4 on Hugging Face.

2. Rename the file to: model.onnx

3. Place it in: server/src/model.onnx

# Run the app

1. Go to the server directory.
2. Run the following command:

```
docker compose up -d
```

3. Go to the client directory.
4. Run the following command:

```
npm run dev
```

5. Open the app in your browser at http://localhost:5173
