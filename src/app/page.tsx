"use client";

import AIGenerator from "./components/AIGenerator";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import outputs from "../../amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(outputs);

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <Authenticator>
                {({ signOut, user }) => (
                    <main className="flex-grow">
                        <button onClick={signOut}>サインアウト</button>
                        <AIGenerator user={user} />
                    </main>
                )}
            </Authenticator>
            <Footer />
        </div>
    );
}
