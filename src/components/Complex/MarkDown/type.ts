type MarkdownItem = {
  children: React.ReactNode;
  [key: string]: any;
};

type MarkdownComponent = ({ children, ...props }: MarkdownItem) => React.JSX.Element;

type MarkDownProps = (props: { contents: string }) => React.JSX.Element;

export type { MarkdownItem, MarkdownComponent, MarkDownProps };
