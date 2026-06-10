import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

/**
 * Workaround for Next.js Pages Router CSS-modules transition FOUC.
 *
 * Next removes the leaving page's <style data-n-href> tags before the
 * framer-motion exit animation finishes, causing a flash of unstyled
 * content on the page that's still visible. This hook:
 *   - Renames data-n-href / data-n-p so Next can't strip them
 *   - Tracks css hashes per route in a Map
 *   - Sweeps any stale <style>/<link> tags only after routeChangeComplete
 *
 * Source: https://github.com/vercel/next.js/issues/17464
 */
export default function useNextCssRemovalPrevention() {
  const { events } = useRouter();
  const fullAsPath = useFullAsPath();
  const cssHashMap = useRef<Map<string, Set<string>>>(new Map());
  const currentUrl = useRef<string | null>(null);
  const previousUrl = useRef<string | null>(null);
  const referenceNode = useRef<Element | null>(null);

  const registerCssHash = useCallback(
    (pageUrl: string | null, href: string | null) => {
      if (pageUrl && href) {
        const hashMap = cssHashMap.current;
        const hashes = hashMap.get(pageUrl) ?? new Set<string>();
        const hash = getHash(href);
        if (hash && !hashes.has(hash)) {
          hashes.add(hash);
          hashMap.set(pageUrl, hashes);
        }
      }
    },
    [],
  );

  const getActiveStyleNodes = useCallback(() => {
    const linkNodesSelector = "head > link[data-n-p-perm]";
    const styleNodesSelector = "head > style[data-n-href-perm]";
    const nodes = querySelectorAllArray(
      [linkNodesSelector, styleNodesSelector].join(","),
    );
    return nodes.map((node) => {
      const href =
        node.nodeName === "LINK"
          ? node.getAttribute("href")
          : node.getAttribute("data-n-href-perm");
      const hash = getHash(href);
      return { node, hash };
    });
  }, []);

  const getActiveCssHashes = useCallback(() => {
    const currentHashes = currentUrl.current
      ? cssHashMap.current.get(currentUrl.current) ?? new Set<string>()
      : new Set<string>();
    const previousHashes = previousUrl.current
      ? cssHashMap.current.get(previousUrl.current) ?? new Set<string>()
      : new Set<string>();
    return [...currentHashes, ...previousHashes];
  }, []);

  const removeExpiredStyles = useCallback(() => {
    const activeCssHashes = getActiveCssHashes();
    getActiveStyleNodes().forEach(({ node, hash }) => {
      if (hash && !activeCssHashes.includes(hash)) {
        node.parentNode?.removeChild(node);
      }
    });
  }, [getActiveStyleNodes, getActiveCssHashes]);

  // Initial pass: convert SSR-rendered <link data-n-p> tags so Next can't
  // remove them, register their hashes against the current URL.
  useEffect(() => {
    if (fullAsPath && !currentUrl.current) {
      currentUrl.current = fullAsPath;
      querySelectorAllArray("head > link[data-n-p]")
        .reverse()
        .forEach((linkNode) => {
          linkNode.removeAttribute("data-n-p");
          linkNode.setAttribute("data-n-p-perm", "");
          registerCssHash(fullAsPath, linkNode.getAttribute("href"));
          moveNodeBelowReferenceNode(linkNode);
        });
    }
  }, [fullAsPath, registerCssHash]);

  // Track current/previous URL across route changes; sweep stale styles
  // only after routeChangeComplete so the leaving page keeps its CSS while
  // it's still being animated out.
  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      referenceNode.current = getReferenceNode();
      previousUrl.current = currentUrl.current;
      currentUrl.current = url;
    };
    const handleRouteChangeComplete = () => {
      removeExpiredStyles();
      previousUrl.current = null;
    };
    events.on("routeChangeStart", handleRouteChangeStart);
    events.on("routeChangeComplete", handleRouteChangeComplete);
    return () => {
      events.off("routeChangeStart", handleRouteChangeStart);
      events.off("routeChangeComplete", handleRouteChangeComplete);
    };
  }, [events, removeExpiredStyles]);

  // Catch <style data-n-href> tags as Next inserts them for new routes:
  // rename the attr so Next leaves them alone, drop media="x", register
  // the hash, and keep them ordered after the SSR reference node.
  useEffect(() => {
    const mutationHandler: MutationCallback = (mutations) => {
      mutations.forEach(({ target, addedNodes }) => {
        if ((target as Element).nodeName === "HEAD") {
          addedNodes.forEach((node) => {
            const el = node as Element;
            if (el.nodeName === "STYLE" && el.hasAttribute("data-n-href")) {
              const href = el.getAttribute("data-n-href") ?? "";
              el.setAttribute("data-n-href-perm", href);
              el.removeAttribute("data-n-href");
              if (el.getAttribute("media") === "x") {
                el.removeAttribute("media");
              }
              registerCssHash(currentUrl.current, href);
              moveNodeBelowReferenceNode(el);
              referenceNode.current = el;
            }
          });
        }
      });
    };

    const observer = new MutationObserver(mutationHandler);
    observer.observe(document.head, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
    };
  }, [registerCssHash]);

  return removeExpiredStyles;
}

function getHash(url: string | null): string | null {
  return url?.match(/([a-z0-9]+)\.css$/)?.[1] ?? null;
}

function querySelectorAllArray(selector: string): Element[] {
  return Array.from(document.querySelectorAll(selector));
}

function getReferenceNode(): Element | null {
  return document.querySelector("noscript[data-n-css]");
}

function moveNodeBelowReferenceNode(node: Element) {
  const ref = getReferenceNode();
  ref?.parentNode?.insertBefore(node, ref?.nextSibling);
}

function useFullAsPath(): string | null {
  const { isReady, asPath, basePath, locale } = useRouter();
  const getFullAsPath = useCallback(() => {
    if (!isReady) return null;
    let result = asPath;
    if (basePath) result = basePath + (result === "/" ? "" : result);
    if (locale) result = `/${locale}${result}`;
    return result;
  }, [asPath, isReady, basePath, locale]);
  const [fullAsPath, setFullAsPath] = useState<string | null>(getFullAsPath());
  useEffect(() => {
    setFullAsPath(getFullAsPath());
  }, [getFullAsPath]);
  return fullAsPath;
}
