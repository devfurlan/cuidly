import { Fragment } from 'react';

export default function TagsList({
  tags,
}: {
  tags: { name: string; slug: string }[];
}) {
  return (
    <div className="hidden">
      {tags.map((tag) => (
        <Fragment key={tag.slug}>{tag.name}, </Fragment>
      ))}
    </div>
  );
}
