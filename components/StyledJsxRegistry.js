'use client';
import { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { StyleRegistry, createStyleRegistry } from 'styled-jsx';

// Without this registry the app router leaves every <style jsx> block out of
// the server HTML, so components render unstyled until the JS bundle hydrates
// — on a slow phone connection the navbar (and its supposedly hidden sheet)
// sat raw on screen for seconds.
export default function StyledJsxRegistry({ children }) {
  const [jsxStyleRegistry] = useState(() => createStyleRegistry());

  useServerInsertedHTML(() => {
    const styles = jsxStyleRegistry.styles();
    jsxStyleRegistry.flush();
    return <>{styles}</>;
  });

  return <StyleRegistry registry={jsxStyleRegistry}>{children}</StyleRegistry>;
}
