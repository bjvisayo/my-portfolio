export default function Link({ href, children, className = "", onClick, ...props }) {
  const handleClick = (event) => {
    onClick?.(event);
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!href || href.startsWith("#") || href.startsWith("http")) return;
    event.preventDefault();
    window.history.pushState({}, "", href);
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.dispatchEvent(new Event("xk:navigate"));
  };

  return (
    <a href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
