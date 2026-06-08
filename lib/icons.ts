/**
 * Type-safe Material Symbols registry.
 *
 * Every icon used in the app must be listed here. The Google Fonts stylesheet
 * is subset to exactly these glyphs via `icon_names`, keeping the icon font
 * tiny, and the `MaterialIcon` union makes a missing icon a compile error.
 */
export const MATERIAL_ICONS = [
  // nav / chrome
  "search",
  "notifications",
  "account_circle",
  "shopping_cart",
  "shopping_bag",
  "menu",
  "close",
  "logout",
  "settings",
  "person",
  // categories
  "devices",
  "apparel",
  "chair",
  "spa",
  "sports_basketball",
  "menu_book",
  // directional
  "arrow_forward",
  "arrow_back",
  "arrow_forward_ios",
  "arrow_outward",
  "chevron_right",
  "chevron_left",
  "expand_more",
  "north_east",
  // ratings / favorites
  "star",
  "star_half",
  "star_border",
  "favorite",
  "favorite_border",
  // commerce
  "add",
  "remove",
  "add_shopping_cart",
  "remove_shopping_cart",
  "check",
  "check_circle",
  "done_all",
  "local_shipping",
  "inventory_2",
  "storefront",
  "verified",
  "verified_user",
  "local_offer",
  "percent",
  "bolt",
  "public",
  // dashboards / data
  "dashboard",
  "group",
  "payments",
  "attach_money",
  "credit_card",
  "lock",
  "mail",
  "location_on",
  "trending_up",
  "trending_down",
  "arrow_upward",
  "arrow_downward",
  "filter_list",
  "sort",
  "grid_view",
  "view_list",
  "delete",
  "edit",
  "visibility",
  "more_vert",
  "tune",
  "fiber_manual_record",
  "schedule",
  "pending",
  "cancel",
  "analytics",
  "store",
  "monitor_heart",
  "warning",
  "error",
  "block",
  "manage_search",
  "refresh",
  "add_business",
  // order tracking / misc
  "home",
  "chat",
  "download",
  "receipt_long",
  "inventory",
  "pin_drop",
  "zoom_in",
  "zoom_out",
] as const;

export type MaterialIcon = (typeof MATERIAL_ICONS)[number];

/** Subset-loaded Material Symbols stylesheet URL. */
export const MATERIAL_SYMBOLS_HREF =
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=" +
  [...MATERIAL_ICONS].sort().join(",") +
  "&display=block";
