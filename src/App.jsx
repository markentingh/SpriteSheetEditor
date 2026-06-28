import routes from './routes'

function App() {
  const currentPath = window.location.pathname
  const route = routes.find(r => r.path === currentPath) || routes[0]
  const Component = route.component

  return <Component />
}

export default App
