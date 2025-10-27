import { renderApp } from "../test/utils/renderWithProviders.jsx";

const { container } = renderApp({ route: process.argv[2] || "/" });
console.log(container.innerHTML.slice(0, 500));
