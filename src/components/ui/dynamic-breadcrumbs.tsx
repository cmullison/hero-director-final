import * as React from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";
import { data } from "@/components/dash-ui/app-sidebar";

interface BreadcrumbSegment {
  title: string;
  url: string;
  isLast: boolean;
}

export function DynamicBreadcrumbs() {
  const location = useLocation();

  // Maximum number of breadcrumb items to show (including Dashboard and current page)
  const maxVisibleItems = 4;

  // Function to generate breadcrumb segments from the current path
  const generateBreadcrumbs = (): BreadcrumbSegment[] => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    if (pathSegments.length === 0) return [];

    const breadcrumbs: BreadcrumbSegment[] = [];
    let currentPath = "";

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Find matching navigation item
      const navItem = data.navMain.find(
        (item) =>
          item.url === currentPath ||
          item.items?.some((subItem) => subItem.url === currentPath)
      );

      // If it's a main nav item
      if (navItem?.url === currentPath) {
        // Skip adding "Dashboard" twice in the path
        if (navItem.title !== "Dashboard" || index === 0) {
          breadcrumbs.push({
            title: navItem.title,
            url: currentPath,
            isLast: index === pathSegments.length - 1,
          });
        }
      }
      // If it's a sub-item
      else if (navItem) {
        const subItem = navItem.items?.find((item) => item.url === currentPath);
        if (subItem) {
          if (!breadcrumbs.some((b) => b.title === navItem.title)) {
            breadcrumbs.push({
              title: navItem.title,
              url: navItem.url,
              isLast: false,
            });
          }
          breadcrumbs.push({
            title: subItem.title,
            url: currentPath,
            isLast: index === pathSegments.length - 1,
          });
        }
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length === 0) {
    return null;
  }

  // Filter out Dashboard from breadcrumbs since we show it separately
  const filteredBreadcrumbs = breadcrumbs.filter(
    (b) => b.title !== "Dashboard"
  );

  // Implement truncation logic - prioritize showing the most specific (rightmost) items
  const shouldTruncate = filteredBreadcrumbs.length > maxVisibleItems - 1; // -1 for Dashboard
  const visibleBreadcrumbs = shouldTruncate
    ? filteredBreadcrumbs.slice(-(maxVisibleItems - 2)) // -2 for Dashboard and ellipsis
    : filteredBreadcrumbs;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <Link to="/dashboard" className="hover:underline">
            Dashboard
          </Link>
        </BreadcrumbItem>

        {(filteredBreadcrumbs.length > 0 || shouldTruncate) && (
          <BreadcrumbSeparator />
        )}

        {shouldTruncate && (
          <>
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}

        {visibleBreadcrumbs.map((breadcrumb, index) => {
          const isLast = index === visibleBreadcrumbs.length - 1;

          return (
            <React.Fragment key={breadcrumb.url}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{breadcrumb.title}</BreadcrumbPage>
                ) : (
                  <Link to={breadcrumb.url} className="hover:underline">
                    {breadcrumb.title}
                  </Link>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
