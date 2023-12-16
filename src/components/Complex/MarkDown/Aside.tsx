import { MarkdownComponent } from './type';

const Aside: MarkdownComponent = ({ children, ...props }) => (
  <aside {...props} className={'w-full bg-basic-3 p-2 rounded my-3 [&>p]:my-0'}>
    {children}
  </aside>
);

export default Aside;
