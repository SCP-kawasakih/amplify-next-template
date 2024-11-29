import AIGenerator from "./components/AIGenerator";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json";
Amplify.configure(outputs);

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
                <AIGenerator />
            </main>
            <Footer />
        </div>
    );
}
