"use client";

import { useState, useEffect } from "react";
import type { Schema } from "../../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { AuthUser } from "aws-amplify/auth";

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
    const [input, setInput] = useState("");
    const [result, setResult] = useState("");
    const [history, setHistory] = useState<Entry[]>([]);

    const fetchTodos = async () => {
        const { data: items, errors } =
            await client.models.GenerationHistory.list();
        const mappedItems = items.map((item) => ({
            prompt: item.prompt,
            result: item.result,
        }));
        setHistory(mappedItems);
    };

    useEffect(() => {
        fetchTodos();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // バックエンドにデータを送信してAI生成結果を取得
        const response = `（${input}に対する返事）`;
        setResult(response);

        const newEntry: Entry = { prompt: input, result: response };
        setHistory([...history, newEntry]);
        await client.models.GenerationHistory.create({
            prompt: input,
            result: response,
        });
    };

    return (
        <div className="container mx-auto p-4 flex flex-col md:flex-row">
            <div className="md:w-1/2 p-4">
                <h2 className="text-xl font-bold mb-4">私の悩み</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="input" className="block mb-2">
                            なんでも言うてみ：
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
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
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
                <h3 className="text-lg font-bold mt-4">思い出</h3>
                <ul>
                    {history.map((entry, index) => (
                        <li
                            key={index}
                            className="border-b border-gray-300 py-2"
                        >
                            <strong>私</strong> 「{entry.prompt}」 <br />
                            <strong>彼</strong> 「{entry.result}」
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
