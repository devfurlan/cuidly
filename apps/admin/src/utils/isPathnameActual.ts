export function isPathnameActual(
  pathname: string,
  href: string,
  exact: boolean = false,
): boolean {
  return exact
    ? pathname === href
    : pathname === href || pathname.startsWith(href + '/');
}
