import { forwardRef, type ReactNode } from "react";
import { NavLink, type NavLinkProps } from "react-router-dom";

type RenderArgs = { isActive: boolean; isPending: boolean };
type Child = ReactNode | ((args: RenderArgs) => ReactNode);

export type RouterLinkProps = Omit<NavLinkProps, "children"> & {
  children: Child;
};

export const RouterLink = forwardRef<HTMLAnchorElement, RouterLinkProps>(
  ({ children, ...props }, ref) => (
    <NavLink
      ref={ref}
      {...props}
      style={{ textDecoration: "none", ...(props.style ?? {}) }}
    >
      {(args) =>
        typeof children === "function" ? (children)(args) : children
      }
    </NavLink>
  )
);

RouterLink.displayName = "RouterLink";