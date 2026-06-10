import Head from "next/head";
import { GetStaticPaths, GetStaticProps } from "next";
import WorkBlock from "@/sections/workBlock";
import { WORK_ITEMS, WorkItem } from "@/data/workItems";
import Footer from "@/sections/footer";

interface WorkPageProps {
  page: WorkItem;
}

export default function WorkPage({ page }: WorkPageProps) {
  return (
    <>
      <Head>
        <title>{`${page.title} — ${page.client}`}</title>
        <meta name="description" content={`${page.title} by ${page.client}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <WorkBlock page={page} />
        <Footer page={page.slug} />
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = ({ params }) => {
  const page = WORK_ITEMS.find((item) => item.slug === params?.slug);

  if (!page) return { notFound: true };

  return { props: { page } };
};

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: WORK_ITEMS.map((item) => ({ params: { slug: item.slug } })),
    fallback: false,
  };
};
