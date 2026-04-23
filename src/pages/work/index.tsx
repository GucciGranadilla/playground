import Head from "next/head";
import WorkWave from "@/sections/workWave";
import Footer from "@/sections/footer";

export default function Work() {
  return (
    <>
      <Head>
        <title>Work — Kevin Davis</title>
        <meta name="description" content="Selected work by Kevin Davis" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <WorkWave />
      </main>
    </>
  );
}
