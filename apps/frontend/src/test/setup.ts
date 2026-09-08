// jsdom não implementa rolagem; a rolagem e o layout são verificados no navegador real.
if (typeof window !== 'undefined') window.scrollTo = () => {};
