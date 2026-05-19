export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    Host: 'app.xtotoro.com',
    Connection: 'keep-alive',
    'Accept-Encoding': 'gzip, deflate, br',
    'User-Agent': 'TotoroSchool/1.2.14 (iPhone; iOS 17.4.1; Scale/3.00)',
    Cookie: event.node.req.headers.cookie,
    Accept: 'application/json',
  };
  const path = event.path.replace('/api/totoro/', '/app/');
  // event.context.params.slug to get the route segment: 'bar/baz'
  return fetch(`https://app.xtotoro.com${path}`, {
    method: 'post',
    headers: { ...(headers as HeadersInit) },
    body,
  });
});
