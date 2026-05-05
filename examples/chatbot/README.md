# chatbot example

```bash
pnpm --filter @neurova-examples/chatbot dev
curl -X POST localhost:3001/chat -H 'content-type: application/json' -d '{"message":"hi"}'
```

Set `OPENAI_API_KEY` to use OpenAI; otherwise the echo provider is used.
