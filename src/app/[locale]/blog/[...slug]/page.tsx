import Image from "next/image";
import Avatar from "@/shared/Avatar";
import Badge from "@/shared/Badge";
import SocialsList from "@/shared/SocialsList";
import RelatedPosts from "./RelatedPosts"; // Client Component
import { blogPostService } from "@/services";

interface PageProps {
  params: { slug: string };
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) {
    return "";
  }
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const calculateReadTime = (content: string) => {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
};

const Page = async ({ params }: PageProps) => {
  const post = await blogPostService.getBySlug(params.slug, {
    populate: "createdBy;categories;tags",
  });
  if (!post) {
    return (
      <div className="nc-PageSingle pt-8 lg:pt-16">
        <div className="container text-center py-16">
          <p className="text-red-500">Post not found</p>
        </div>
      </div>
    );
  }

  const authorName = post.createdBy ? `${post.createdBy.name}` : "Anonymous";

  return (
    <div className="nc-PageSingle pt-8 lg:pt-16">
      {/* Header */}
      <header className="container rounded-xl">
        <div className="max-w-screen-md mx-auto space-y-5">
          {post.categories.length > 0 && (
            <Badge color="purple" name={post.categories[0].name} />
          )}
          <h1
            className="text-neutral-900 font-semibold text-3xl md:text-4xl md:!leading-[120%] lg:text-4xl dark:text-neutral-100 max-w-4xl"
            title={post.title}
          >
            {post.title}
          </h1>
          <span className="block text-base text-neutral-500 md:text-lg dark:text-neutral-400 pb-1">
            {post.summary}
          </span>

          <div className="w-full border-b border-neutral-100 dark:border-neutral-800"></div>

          <div className="flex flex-col items-baseline sm:flex-row sm:justify-between">
            <div className="nc-PostMeta2 flex items-center flex-wrap text-neutral-700 text-left dark:text-neutral-200 text-sm leading-none flex-shrink-0">
              <Avatar
                containerClassName="flex-shrink-0"
                sizeClass="w-8 h-8 sm:h-11 sm:w-11"
                imgUrl={post.createdBy?.avatar}
              />
              <div className="ml-3">
                <div className="flex items-center">
                  <a className="block font-semibold" href="/">
                    {authorName}
                  </a>
                </div>
                <div className="text-xs mt-[6px]">
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {formatDate(post.publishedAt)}
                  </span>
                  <span className="mx-2 font-semibold">·</span>
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {calculateReadTime(post.content)}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-3">
              <SocialsList />
            </div>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      <div className="container max-w-screen-md my-10 sm:my-12 w-full relative">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.coverImageAlt || post.title}
            width={1200} // chỉ cần width chuẩn desktop
            height={800} // tạm lấy ratio gần đúng
            className="w-full h-auto rounded-xl object-cover"
          />
        ) : null}
      </div>

      {/* Content */}
      <div className="nc-SingleContent container space-y-10">
        <div
          id="single-entry-content"
          className="prose dark:prose-invert prose-sm !max-w-screen-md sm:prose lg:prose-lg mx-auto dark:prose-dark"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="max-w-screen-md mx-auto flex flex-wrap">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="nc-Tag rounded inline-block bg-white text-sm text-neutral-600 dark:text-neutral-300 py-2 px-3 rounded-lg border border-neutral-100 md:px-4 dark:bg-neutral-700 dark:border-neutral-700 hover:border-neutral-200 dark:hover:border-neutral-600 mr-2 mb-2"
              >
                # {tag.name}
              </span>
            ))}
          </div>
        )}

        <div className="max-w-screen-md mx-auto border-b border-t border-neutral-100 dark:border-neutral-700"></div>

        {/* Author */}
        {post.createdBy && (
          <div className="max-w-screen-md mx-auto">
            <div className="nc-SingleAuthor flex">
              <Avatar
                sizeClass="w-11 h-11 md:w-24 md:h-24"
                imgUrl={post.createdBy.avatar}
              />
              <div className="flex flex-col ml-3 max-w-lg sm:ml-5 space-y-1">
                <span className="text-xs text-neutral-400 uppercase tracking-wider">
                  WRITTEN BY
                </span>
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-200">
                  <a href={`/author/${post.createdBy.id}`}>{authorName}</a>
                </h2>
                <span className="text-sm text-neutral-500 sm:text-base dark:text-neutral-300">
                  {post.createdBy.bio || "No bio available"}
                  <a
                    className="text-primary-6000 font-medium ml-1"
                    href={`/author/${post.createdBy.id}`}
                  >
                    Read more
                  </a>
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="mb"></div>

        {/* Comments */}
        {/* <div className="max-w-screen-md mx-auto pt-5">
          <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
            Responses (14)
          </h3>
          <div className="nc-SingleCommentForm mt-5">
            <Textarea />
            <div className="mt-2 space-x-3">
              <ButtonPrimary>Submit</ButtonPrimary>
              <ButtonSecondary>Cancel</ButtonSecondary>
            </div>
          </div>
        </div>

        <div className="max-w-screen-md mx-auto">
          <ul className="nc-SingleCommentLists space-y-5">
            <li>
              <Comment />
              <ul className="pl-4 mt-5 space-y-5 md:pl-11">
                <li>
                  <Comment isSmall />
                </li>
              </ul>
            </li>
          </ul>
        </div> */}
      </div>

      {/* Related posts */}
      {post.createdBy?.id && (
        <RelatedPosts authorId={post.createdBy.id} currentPostId={post.id} />
      )}
    </div>
  );
};

export default Page;
