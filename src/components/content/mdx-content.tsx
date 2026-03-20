import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";

const rehypePrettyCodeOptions = {
  theme: "github-dark-default",
  keepBackground: true,
};

interface MdxContentProps {
  source: string;
}

export function MdxContent({ source }: MdxContentProps) {
  return (
    <div className="prose">
      <MDXRemote
        source={source}
        options={{
          mdxOptions: {
            rehypePlugins: [
              [rehypePrettyCode, rehypePrettyCodeOptions],
            ],
          },
        }}
      />
    </div>
  );
}
