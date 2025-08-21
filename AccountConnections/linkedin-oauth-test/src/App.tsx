import { ConvexProvider, ConvexReactClient } from "convex/react";
import { LinkedInTest } from "./LinkedInTest";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function App() {
  return (
    <ConvexProvider client={convex}>
      <LinkedInTest />
    </ConvexProvider>
  );
}

export default App;
