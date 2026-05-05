export default function Page() {
  return (
    <article>
      <h1>@neurova/cli</h1>
      <pre>{`npm install -g @neurova/cli
neurova init my-app
neurova info
neurova help`}</pre>
      <h2>Or use npm create</h2>
      <pre>{`npm create neurova@latest my-app`}</pre>
    </article>
  )
}
