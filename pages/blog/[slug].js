import { useRouter } from "next/router";
import {
  getPostBySlug,
  getAllPosts,
  getNextPost,
  getPreviousPost,
  formatDate,
} from "../../lib/lib";
import Head from "next/head";
import Meta from "../../components/Meta";
import ErrorPage from "../404";
import Container from "../../components/Container";
import Markdown from "../../components/Markdown";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SingleColumn from "../../components/SingleColumn";
import Section from "../../components/Section";
import Contact from "../../components/Contact";
import PostPreview from "../../components/PostPreview";
import { decode } from "html-entities";

export default function Post({
  post,
  nextPost,
  previousPost,
  markdown,
  search,
}) {
  const router = useRouter();
  if (!router.isFallback && !post?.slug) {
    return <ErrorPage />;
  }
  return (
    <Container>
      <Head>
        <title>{post.title} • Blog • urbit.org</title>
        {Meta(post)}
      </Head>
      <SingleColumn>
        <Header search={search} />
        <Section short narrow>
          <h1>{post.title}</h1>
          <h3 className=" mt-6">{post.description}</h3>
          <div className="flex items-baseline mt-6">
            {post.extra.author ? (
              <div className="type-sub-bold mr-2">{post.extra.author}</div>
            ) : null}
            {post.extra.ship ? (
              <div className="type-sub-bold text-wall-500 font-mono">
                {post.extra.ship}
              </div>
            ) : null}
          </div>
          <div className="text-wall-500 type-sub">
            {formatDate(new Date(post.date))}
          </div>
        </Section>
        <Section short narrow className="markdown">
          <article
            dangerouslySetInnerHTML={{ __html: decode(markdown) }}
          ></article>
        </Section>
        <Section narrow>
          <Contact />
        </Section>
        <Section wide className="flex">
          {previousPost === null ? (
            <div className={"w-1/2 mr-4"} />
          ) : (
            <PostPreview
              title="Previous Post"
              post={previousPost}
              className="mr-4 w-1/2"
            />
          )}
          {nextPost === null ? (
            <div className={"w-1/2 ml-4"} />
          ) : (
            <PostPreview
              title="Next Post"
              post={nextPost}
              className="ml-4 w-1/2"
            />
          )}
        </Section>
      </SingleColumn>
      <Footer />
    </Container>
  );
}

//
export async function getStaticProps({ params }) {
  const nextPost =
    getNextPost(
      params.slug,
      ["title", "slug", "date", "description", "extra"],
      "blog"
    ) || null;

  const previousPost =
    getPreviousPost(
      params.slug,
      ["title", "slug", "date", "description", "extra"],
      "blog"
    ) || null;

  const post = getPostBySlug(
    params.slug,
    ["title", "slug", "date", "description", "content", "extra"],
    "blog"
  );

  const markdown = await Markdown({ post });

  return {
    props: { post, markdown, nextPost, previousPost },
  };
}

export async function getStaticPaths() {
  const posts = getAllPosts(["slug", "date"], "blog");

  return {
    paths: posts.map((post) => {
      return {
        params: {
          slug: post.slug,
        },
      };
    }),
    fallback: false,
  };
}
