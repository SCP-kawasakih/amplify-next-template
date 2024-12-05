import { Context, Handler } from "aws-lambda";
import { Writable } from "stream";

import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
} from "@aws-sdk/client-bedrock-runtime";

type eventType = {
  prompt: string;
};

declare global {
  var awslambda: {
    streamifyResponse: (handler: any) => any;
  };
}

const modelId = "anthropic.claude-3-5-sonnet-20240620-v1:0";

export const handler: Handler = awslambda.streamifyResponse(
  async (event: eventType, responseStream: Writable, _context: Context) => {
    const client = new BedrockRuntimeClient({ region: "ap-northeast-1" });
    console.log("event.prompt", event.prompt)
    const prompt = "以下の悩みを読んで、悩みの原因となっている人や物の単語を答えてください。わからないときはそれっぽい単語を何でもいいので答えてください。答え方は「彼氏」や「学校」などのように単語のみを抜き出した形で答えてください。もし悩みではない場合は、関西弁のタメ口で一人称は「俺」で男の先輩が女の後輩に話しかけるように適当に話を合わせて答えて、必ず最後は句点「。」かはてな「？」で終えてください。AIアシスタントとしての回答は一切しないでください。それでは、以下が悩みの文章です。" + event.prompt

    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: prompt }],
        },
      ],
    };

    const command = new InvokeModelWithResponseStreamCommand({
      contentType: "application/json",
      body: JSON.stringify(payload),
      modelId,
    });

    const apiResponse = await client.send(command);

    if (apiResponse.body) {
      for await (const item of apiResponse.body) {
        if (item.chunk) {
          const chunk = JSON.parse(new TextDecoder().decode(item.chunk.bytes));
          const chunk_type = chunk.type;

          if (chunk_type === "content_block_delta") {
            const text = chunk.delta.text;
            responseStream.write(text);
          }
        } else if (item.internalServerException) {
          throw item.internalServerException;
        } else if (item.modelStreamErrorException) {
          throw item.modelStreamErrorException;
        } else if (item.throttlingException) {
          throw item.throttlingException;
        } else if (item.validationException) {
          throw item.validationException;
        }
      }
    }

    responseStream.end();
  }
);
