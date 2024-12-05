"use client";

import { useState, useEffect } from "react";
import type { Schema } from "../../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { AuthUser } from "aws-amplify/auth";
import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";
import { fetchAuthSession } from "aws-amplify/auth";

import outputs from "../../../amplify_outputs.json";

const initializeLambdaClient = async () => {
  const { credentials } = await fetchAuthSession();
  return {
    credentials,
    awsRegion: outputs.auth.aws_region,
    functionName: outputs.custom.invokeBedrockFunctionName
  };
};

// エントリの型を定義
type Entry = {
  prompt: string;
  result: string;
};

// AIGeneratorコンポーネントのプロパティ型を定義
interface AIGeneratorProps {
  user: AuthUser | undefined;
}

const client = generateClient<Schema>();

export default function AIGenerator({ user }: AIGeneratorProps) {
  const [lambdaConfig, setLambdaConfig] = useState<any>(null);

  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [history, setHistory] = useState<Entry[]>([]);

  const fetchTodos = async () => {
    const { data: items, errors } = await client.models.GenerationHistory.list({
      filter: {
        userId: {
          eq: user?.userId,
        },
      },
    });
    const mappedItems = items.map((item) => ({
      prompt: item.prompt,
      result: item.result,
    }));
    setHistory(mappedItems);
  };

  useEffect(() => {
    fetchTodos();
    initializeLambdaClient().then(config => {
      setLambdaConfig(config);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("input", input)
    e.preventDefault();
    // バックエンドにデータを送信してAI生成結果を取得
    const lambda = new LambdaClient({
      credentials: lambdaConfig.credentials,
      region: lambdaConfig.awsRegion,
    });
    const command = new InvokeCommand({
      FunctionName: lambdaConfig.functionName,
      Payload: JSON.stringify({ prompt: input }),
      InvocationType: 'RequestResponse',
    });
    const response = await lambda.send(command);
    // PayloadをTextDecoderで適切にデコード
    if (response.Payload) {
      const res = new TextDecoder().decode(response.Payload);
      console.log("result", res)
      let result = ""
      if (res.match(/[。？]$/)) {
        result = res
      } else {
        result = "あーそれは" + res + "が悪いわ俺ならそんな思いさせへんのにまた今度飲み行こやいやお前は妹みたいなもんやし手出すわけないやん守ってあげたいし後輩にそんなことするわけないやんじゃ、挿れるで......"
      }
      // 保存処理
      await client.models.GenerationHistory.create({
        prompt: input,
        result: result,
        userId: user?.userId,
      });
      setResult(result)

      // 履歴を更新
      setHistory(prev => [...prev, { prompt: input, result: result }]);
    }
  };

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row">
      <div className="md:w-1/2 p-4">
        <h2 className="text-xl font-bold mb-4">私の悩み</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="input" className="block mb-2">
              なんでも言うてみ
            </label>
            <textarea
              id="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-black"
              rows={4}
            />
          </div>
          <button
            type="submit"
            className="bg-red-400 text-white px-4 py-2 rounded hover:bg-red-500"
          >
            話す
          </button>
        </form>
      </div>
      <div className="md:w-1/2 p-4">
        <h2 className="text-xl font-bold mb-4">彼の答え</h2>
        <div className="border border-gray-300 rounded p-4 min-h-[200px]">
          {result || ""}
        </div>
        {/* <h3 className="text-lg font-bold mt-4">思い出</h3>
        <ul>
          {history.map((entry, index) => (
            <li key={index} className="border-b border-gray-300 py-2">
              <strong>私</strong> 「{entry.prompt}」 <br />
              <strong>彼</strong> 「{entry.result}」
            </li>
          ))}
        </ul> */}
      </div>
    </div>
  );
}
