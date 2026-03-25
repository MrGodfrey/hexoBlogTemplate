export async function onRequest(context) {
  const path = decodeURIComponent(context.params.path.join('/'));
  const object = await context.env.BUCKET.get(path);

  if (object === null) {
    return new Response('Not found', { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);

  return new Response(object.body, { headers });
}