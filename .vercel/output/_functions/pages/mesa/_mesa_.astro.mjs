import { e as createComponent, k as renderComponent, r as renderTemplate, h as createAstro } from '../../chunks/astro/server_0IadgrTN.mjs';
import 'piccolore';
import { $ as $$Layout } from '../../chunks/Layout_zzDEcozS.mjs';
import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { useRef, useState, useEffect, useCallback } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { a as useCartStore, u as useUserStore, A as AuthModal } from '../../chunks/AuthModal_5dQYj4yd.mjs';
import { x as getWalletBalance, y as payWithWallet, p as payOrders, z as createServiceRequest, A as getMyTickets, B as sendTicketEmail, C as sendAllTicketsEmail, D as getMyOrders, s as subscribeToOrders, E as getWalletTransactions, F as rechargeWallet, G as getPartialPayments, H as payPartial, g as getAdminSettings, n as getGroupSession, I as createGroupSession, r as unclaimGroupItem, v as claimGroupItem, w as payGroupShare, J as hostPayVenue, K as getUnpaidOrdersByTable, o as getCurrentUser, d as getCategories, e as getProducts, L as createOrder } from '../../chunks/db_DD6f8SZr.mjs';
import { IoCartOutline, IoTimeOutline, IoReceiptOutline, IoWalletOutline, IoCallOutline, IoLogOutOutline, IoRemove, IoAdd, IoClose, IoTrashOutline, IoSendOutline, IoArrowBack, IoPhonePortraitOutline, IoCardOutline, IoCashOutline, IoMailUnreadOutline, IoCloseOutline, IoMailOutline, IoQrCodeOutline, IoCheckmarkDoneOutline, IoFlameOutline, IoArrowDownCircleOutline, IoArrowUpCircleOutline, IoChatbubbleEllipsesOutline, IoPersonOutline, IoCheckmarkCircle } from 'react-icons/io5';
import { s as styles, a as styles$1, b as styles$2, c as styles$3, d as styles$4, e as styles$5, f as styles$6, g as styles$7, h as styles$8, i as styles$9, j as styles$a, k as styles$b } from '../../chunks/_mesa_.03708f80_Bi0xFyuW.mjs';
import { A as ALLERGEN_INFO } from '../../chunks/types_CO5ADS75.mjs';
import { QRCodeSVG } from 'qrcode.react';
export { renderers } from '../../renderers.mjs';

function CustomerHeader({ tableNumber, userName, onCartClick, onTicketsClick, onOrdersClick, onWalletClick, onLogout, onCallWaiter }) {
  const itemCount = useCartStore((s) => s.getItemCount());
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("header", { className: styles.header, children: /* @__PURE__ */ jsxs("div", { className: styles.inner, children: [
      /* @__PURE__ */ jsxs("div", { className: styles.brand, children: [
        /* @__PURE__ */ jsx("img", { src: "/logo.png", alt: "ORDERLY", className: styles.logoImg }),
        /* @__PURE__ */ jsxs("div", { className: styles.brandText, children: [
          /* @__PURE__ */ jsx("span", { className: styles.greeting, children: userName ? `Hola, ${userName}` : "ORDERLY" }),
          /* @__PURE__ */ jsxs("span", { className: styles.tableBadge, children: [
            "Mesa ",
            tableNumber
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: styles.right, children: /* @__PURE__ */ jsxs("button", { className: styles.cartBtn, onClick: onCartClick, "aria-label": "Carrito", children: [
        /* @__PURE__ */ jsx(IoCartOutline, { size: 22 }),
        itemCount > 0 && /* @__PURE__ */ jsx("span", { className: styles.badge, children: itemCount })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsx("nav", { className: styles.bottomNav, children: /* @__PURE__ */ jsxs("div", { className: styles.bottomNavInner, children: [
      /* @__PURE__ */ jsxs("button", { className: styles.navItem, onClick: onCartClick, children: [
        /* @__PURE__ */ jsx("span", { className: styles.navIcon, children: /* @__PURE__ */ jsx(IoCartOutline, { size: 20 }) }),
        /* @__PURE__ */ jsx("span", { className: styles.navLabel, children: "Carrito" }),
        itemCount > 0 && /* @__PURE__ */ jsx("span", { className: styles.navBadge, children: itemCount })
      ] }),
      onOrdersClick && /* @__PURE__ */ jsxs("button", { className: styles.navItem, onClick: onOrdersClick, children: [
        /* @__PURE__ */ jsx("span", { className: styles.navIcon, children: /* @__PURE__ */ jsx(IoTimeOutline, { size: 20 }) }),
        /* @__PURE__ */ jsx("span", { className: styles.navLabel, children: "Pedidos" })
      ] }),
      onTicketsClick && /* @__PURE__ */ jsxs("button", { className: styles.navItem, onClick: onTicketsClick, children: [
        /* @__PURE__ */ jsx("span", { className: styles.navIcon, children: /* @__PURE__ */ jsx(IoReceiptOutline, { size: 20 }) }),
        /* @__PURE__ */ jsx("span", { className: styles.navLabel, children: "Tickets" })
      ] }),
      onWalletClick && /* @__PURE__ */ jsxs("button", { className: styles.navItem, onClick: onWalletClick, children: [
        /* @__PURE__ */ jsx("span", { className: styles.navIcon, children: /* @__PURE__ */ jsx(IoWalletOutline, { size: 20 }) }),
        /* @__PURE__ */ jsx("span", { className: styles.navLabel, children: "Monedero" })
      ] }),
      onCallWaiter && /* @__PURE__ */ jsxs("button", { className: `${styles.navItem} ${styles.waiterItem}`, onClick: onCallWaiter, children: [
        /* @__PURE__ */ jsx("span", { className: styles.navIcon, children: /* @__PURE__ */ jsx(IoCallOutline, { size: 20 }) }),
        /* @__PURE__ */ jsx("span", { className: styles.navLabel, children: "Camarero" })
      ] }),
      onLogout && /* @__PURE__ */ jsxs("button", { className: `${styles.navItem} ${styles.logoutItem}`, onClick: onLogout, children: [
        /* @__PURE__ */ jsx("span", { className: styles.navIcon, children: /* @__PURE__ */ jsx(IoLogOutOutline, { size: 20 }) }),
        /* @__PURE__ */ jsx("span", { className: styles.navLabel, children: "Salir" })
      ] })
    ] }) })
  ] });
}

const CATEGORY_ICONS = {
  "Cafés": "☕",
  "Tés e infusiones": "🍵",
  "Batidos y smoothies": "🥤",
  "Bollería y dulces": "🥐",
  "Tostas y salados": "🥑",
  "Bebidas frías": "🧊",
  "Cachimbas": "💨",
  "Especiales": "✨"
};
function CategoryTabs({ categories, activeCategory, onSelect }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };
  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
      return () => {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [categories]);
  useEffect(() => {
    if (!activeCategory || !scrollRef.current) return;
    const el = scrollRef.current;
    const activeBtn = el.querySelector(`[data-cat-id="${activeCategory}"]`);
    if (activeBtn) {
      const left = activeBtn.offsetLeft - el.offsetWidth / 2 + activeBtn.offsetWidth / 2;
      el.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
    }
  }, [activeCategory]);
  return /* @__PURE__ */ jsx("div", { className: `${styles$1.wrapper} ${canScrollLeft ? styles$1.fadeLeft : ""} ${canScrollRight ? styles$1.fadeRight : ""}`, children: /* @__PURE__ */ jsx("div", { className: styles$1.tabs, ref: scrollRef, children: categories.map((cat) => /* @__PURE__ */ jsxs(
    "button",
    {
      "data-cat-id": cat.id,
      className: `${styles$1.tab} ${activeCategory === cat.id ? styles$1.active : ""}`,
      onClick: () => onSelect(cat.id),
      children: [
        /* @__PURE__ */ jsx("span", { className: styles$1.icon, children: CATEGORY_ICONS[cat.name] || "📋" }),
        /* @__PURE__ */ jsx("span", { className: styles$1.label, children: cat.name })
      ]
    },
    cat.id
  )) }) });
}

function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const items = useCartStore((s) => s.items);
  const quantity = items.find((i) => i.product.id === product.id)?.quantity || 0;
  return /* @__PURE__ */ jsxs("div", { className: `${styles$2.card} ${quantity > 0 ? styles$2.inCart : ""}`, children: [
    product.image_url && /* @__PURE__ */ jsxs("div", { className: styles$2.imageWrap, children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: product.image_url,
          alt: product.name,
          className: styles$2.image,
          loading: "lazy"
        }
      ),
      !product.available && /* @__PURE__ */ jsx("div", { className: styles$2.unavailable, children: "Agotado" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$2.info, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$2.top, children: [
        /* @__PURE__ */ jsx("h3", { className: styles$2.name, children: product.name }),
        product.description && /* @__PURE__ */ jsx("p", { className: styles$2.desc, children: product.description }),
        product.allergens && product.allergens.length > 0 && /* @__PURE__ */ jsx("div", { className: styles$2.allergens, children: product.allergens.map((a) => /* @__PURE__ */ jsxs("span", { className: styles$2.allergenBadge, title: ALLERGEN_INFO[a]?.label || a, children: [
          ALLERGEN_INFO[a]?.icon || "⚠️",
          /* @__PURE__ */ jsx("span", { className: styles$2.allergenLabel, children: ALLERGEN_INFO[a]?.label || a })
        ] }, a)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$2.bottom, children: [
        /* @__PURE__ */ jsxs("span", { className: styles$2.price, children: [
          product.price.toFixed(2),
          " €"
        ] }),
        quantity > 0 ? /* @__PURE__ */ jsxs("div", { className: styles$2.qtyControls, children: [
          /* @__PURE__ */ jsx("button", { className: styles$2.qtyBtn, onClick: () => updateQuantity(product.id, quantity - 1), children: /* @__PURE__ */ jsx(IoRemove, { size: 14 }) }),
          /* @__PURE__ */ jsx("span", { className: styles$2.qtyValue, children: quantity }),
          /* @__PURE__ */ jsx("button", { className: styles$2.qtyBtn, onClick: () => addItem(product), children: /* @__PURE__ */ jsx(IoAdd, { size: 14 }) })
        ] }) : /* @__PURE__ */ jsxs(
          "button",
          {
            className: styles$2.addBtn,
            onClick: () => addItem(product),
            disabled: !product.available,
            children: [
              /* @__PURE__ */ jsx(IoAdd, { size: 18 }),
              /* @__PURE__ */ jsx("span", { children: "Añadir" })
            ]
          }
        )
      ] })
    ] })
  ] });
}

function Cart({ isOpen, onClose, onCheckout, sending }) {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  useCartStore((s) => s.removeItem);
  const updateNotes = useCartStore((s) => s.updateNotes);
  const clearCart = useCartStore((s) => s.clearCart);
  const getTotal = useCartStore((s) => s.getTotal);
  const total = getTotal();
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx("div", { className: styles$3.overlay, onClick: onClose, children: /* @__PURE__ */ jsxs("div", { className: styles$3.drawer, onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs("div", { className: styles$3.header, children: [
      /* @__PURE__ */ jsx("h2", { className: styles$3.title, children: "Tu pedido" }),
      /* @__PURE__ */ jsx("button", { className: styles$3.closeBtn, onClick: onClose, children: /* @__PURE__ */ jsx(IoClose, { size: 22 }) })
    ] }),
    items.length === 0 ? /* @__PURE__ */ jsxs("div", { className: styles$3.empty, children: [
      /* @__PURE__ */ jsx("p", { children: "Tu carrito está vacío" }),
      /* @__PURE__ */ jsx("span", { children: "Añade productos desde el menú" })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: styles$3.items, children: items.map((item) => /* @__PURE__ */ jsxs("div", { className: styles$3.item, children: [
        /* @__PURE__ */ jsxs("div", { className: styles$3.itemInfo, children: [
          /* @__PURE__ */ jsx("span", { className: styles$3.itemName, children: item.product.name }),
          /* @__PURE__ */ jsxs("span", { className: styles$3.itemPrice, children: [
            (item.product.price * item.quantity).toFixed(2),
            " €"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: styles$3.itemActions, children: /* @__PURE__ */ jsxs("div", { className: styles$3.qtyControls, children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              className: styles$3.qtyBtn,
              onClick: () => updateQuantity(item.product.id, item.quantity - 1),
              children: item.quantity === 1 ? /* @__PURE__ */ jsx(IoTrashOutline, { size: 14 }) : /* @__PURE__ */ jsx(IoRemove, { size: 14 })
            }
          ),
          /* @__PURE__ */ jsx("span", { className: styles$3.qtyValue, children: item.quantity }),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: styles$3.qtyBtn,
              onClick: () => updateQuantity(item.product.id, item.quantity + 1),
              children: /* @__PURE__ */ jsx(IoAdd, { size: 14 })
            }
          )
        ] }) }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            className: styles$3.notes,
            placeholder: "Notas (sin hielo, extra leche...)",
            value: item.notes || "",
            onChange: (e) => updateNotes(item.product.id, e.target.value)
          }
        )
      ] }, item.product.id)) }),
      /* @__PURE__ */ jsxs("div", { className: styles$3.footer, children: [
        /* @__PURE__ */ jsx("button", { className: styles$3.clearBtn, onClick: clearCart, children: "Vaciar carrito" }),
        /* @__PURE__ */ jsxs("div", { className: styles$3.totalRow, children: [
          /* @__PURE__ */ jsx("span", { className: styles$3.totalLabel, children: "Total" }),
          /* @__PURE__ */ jsxs("span", { className: styles$3.totalValue, children: [
            total.toFixed(2),
            " €"
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            className: `btn btn-primary btn-lg ${styles$3.checkoutBtn}`,
            onClick: onCheckout,
            disabled: sending,
            children: [
              /* @__PURE__ */ jsx(IoSendOutline, { size: 18 }),
              sending ? "Enviando..." : "Hacer pedido"
            ]
          }
        )
      ] })
    ] })
  ] }) });
}

function PaymentModal({
  isOpen,
  onClose,
  onComplete,
  tableNumber,
  settings = {},
  unpaidOrders
}) {
  const [method, setMethod] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  if (!isOpen || unpaidOrders.length === 0) return null;
  const total = unpaidOrders.reduce((s, o) => s + o.total, 0);
  const allItems = unpaidOrders.flatMap(
    (o) => o.items.map((item) => ({
      name: item.product_name,
      qty: item.quantity,
      price: item.unit_price
    }))
  );
  const orderIds = unpaidOrders.map((o) => o.id);
  const handleBack = () => setMethod(null);
  const handleSelectWallet = async () => {
    try {
      const bal = await getWalletBalance();
      setWalletBalance(bal);
      setMethod("wallet");
    } catch {
      toast.error("Error al consultar el monedero");
    }
  };
  const handleConfirm = async (m) => {
    setProcessing(true);
    try {
      if (m === "wallet") {
        if (walletBalance !== null && walletBalance < total) {
          toast.error("Saldo insuficiente. Recarga tu monedero.");
          setProcessing(false);
          return;
        }
        await payWithWallet(total, `Pago mesa ${tableNumber}`);
        await payOrders(orderIds, "wallet", tableNumber);
        toast.success("¡Pagado con monedero! 💰", { duration: 4e3 });
        setMethod(null);
        onComplete();
      } else if (m === "bizum") {
        await payOrders(orderIds, "bizum", tableNumber);
        toast.success(
          `¡Pago solicitado! Envía ${total.toFixed(2)} € por Bizum al ${settings.bizum_phone || "número del local"}`,
          { duration: 5e3 }
        );
        setMethod(null);
        onComplete();
      } else if (m === "card" || m === "cash") {
        await createServiceRequest("solicitud_pago", tableNumber, {
          method: m === "card" ? "datafono" : "efectivo",
          total,
          orderIds
        });
        const messages = {
          card: "📱 Solicitud enviada. El camarero traerá el datáfono a tu mesa.",
          cash: "💵 Solicitud enviada. El camarero vendrá a cobrarte."
        };
        toast.success(messages[m] || "Solicitud enviada al camarero.", { duration: 5e3 });
        setMethod(null);
        onComplete();
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error(err?.message || "Error al procesar el pago. Inténtalo de nuevo.");
    } finally {
      setProcessing(false);
    }
  };
  const bizumPhone = settings.bizum_phone || "";
  return /* @__PURE__ */ jsx("div", { className: styles$4.overlay, onClick: onClose, children: /* @__PURE__ */ jsxs("div", { className: styles$4.modal, onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs("div", { className: styles$4.header, children: [
      method && /* @__PURE__ */ jsx("button", { className: styles$4.backBtn, onClick: handleBack, children: /* @__PURE__ */ jsx(IoArrowBack, { size: 20 }) }),
      /* @__PURE__ */ jsx("h2", { className: styles$4.title, children: !method ? "Método de pago" : method === "bizum" ? "Pago con Bizum" : method === "card" ? "Pago con tarjeta" : method === "wallet" ? "Pago con monedero" : "Pago en efectivo" })
    ] }),
    method && /* @__PURE__ */ jsxs("div", { className: styles$4.orderSummary, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$4.summaryHeader, children: [
        /* @__PURE__ */ jsx("span", { children: "Tu consumición" }),
        /* @__PURE__ */ jsxs("span", { className: styles$4.summaryTable, children: [
          "Mesa ",
          tableNumber
        ] })
      ] }),
      allItems.map((item, i) => /* @__PURE__ */ jsxs("div", { className: styles$4.summaryItem, children: [
        /* @__PURE__ */ jsxs("span", { children: [
          item.qty,
          "x ",
          item.name
        ] }),
        /* @__PURE__ */ jsxs("span", { children: [
          (item.price * item.qty).toFixed(2),
          " €"
        ] })
      ] }, i)),
      /* @__PURE__ */ jsxs("div", { className: styles$4.summaryTotal, children: [
        /* @__PURE__ */ jsx("span", { children: "Total" }),
        /* @__PURE__ */ jsxs("span", { children: [
          total.toFixed(2),
          " €"
        ] })
      ] })
    ] }),
    !method ? /* @__PURE__ */ jsxs("div", { className: styles$4.methods, children: [
      /* @__PURE__ */ jsxs("button", { className: styles$4.methodBtn, onClick: handleSelectWallet, children: [
        /* @__PURE__ */ jsx("div", { className: styles$4.methodIcon, style: { background: "#fef3c7", color: "#d97706" }, children: /* @__PURE__ */ jsx(IoWalletOutline, { size: 24 }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: styles$4.methodName, children: "Monedero ORDERLY" }),
          /* @__PURE__ */ jsx("span", { className: styles$4.methodDesc, children: "Paga con tu saldo" })
        ] })
      ] }),
      bizumPhone && /* @__PURE__ */ jsxs("button", { className: styles$4.methodBtn, onClick: () => setMethod("bizum"), children: [
        /* @__PURE__ */ jsx("div", { className: styles$4.methodIcon, style: { background: "#dbeafe", color: "#2563eb" }, children: /* @__PURE__ */ jsx(IoPhonePortraitOutline, { size: 24 }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: styles$4.methodName, children: "Bizum" }),
          /* @__PURE__ */ jsxs("span", { className: styles$4.methodDesc, children: [
            "Pago rápido al ",
            bizumPhone
          ] })
        ] }),
        /* @__PURE__ */ jsx("span", { className: styles$4.methodBadge, children: "Recomendado" })
      ] }),
      /* @__PURE__ */ jsxs("button", { className: styles$4.methodBtn, onClick: () => setMethod("card"), children: [
        /* @__PURE__ */ jsx("div", { className: styles$4.methodIcon, style: { background: "#ede9fe", color: "#7c3aed" }, children: /* @__PURE__ */ jsx(IoCardOutline, { size: 24 }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: styles$4.methodName, children: "Tarjeta" }),
          /* @__PURE__ */ jsx("span", { className: styles$4.methodDesc, children: "El camarero trae el datáfono" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("button", { className: styles$4.methodBtn, onClick: () => setMethod("cash"), children: [
        /* @__PURE__ */ jsx("div", { className: styles$4.methodIcon, style: { background: "#d1fae5", color: "#059669" }, children: /* @__PURE__ */ jsx(IoCashOutline, { size: 24 }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: styles$4.methodName, children: "Efectivo" }),
          /* @__PURE__ */ jsx("span", { className: styles$4.methodDesc, children: "Paga en caja o al camarero" })
        ] })
      ] })
    ] }) : method === "wallet" ? /* @__PURE__ */ jsxs("div", { className: styles$4.confirmView, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$4.totalDisplay, children: [
        /* @__PURE__ */ jsx("span", { children: "Total a pagar" }),
        /* @__PURE__ */ jsxs("span", { className: styles$4.totalAmount, children: [
          total.toFixed(2),
          " €"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$4.bizumInfo, children: [
        /* @__PURE__ */ jsxs("div", { className: styles$4.bizumAmount, children: [
          /* @__PURE__ */ jsx("span", { children: "Saldo actual:" }),
          /* @__PURE__ */ jsx("span", { className: styles$4.bizumTotal, children: walletBalance !== null ? walletBalance.toFixed(2) + " €" : "..." })
        ] }),
        walletBalance !== null && walletBalance < total && /* @__PURE__ */ jsx("p", { style: { color: "#dc2626", fontWeight: 600, textAlign: "center", marginTop: "0.5rem" }, children: "Saldo insuficiente. Recarga tu monedero." })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "btn btn-primary btn-lg",
          style: { width: "100%" },
          onClick: () => handleConfirm("wallet"),
          disabled: processing || walletBalance !== null && walletBalance < total,
          children: processing ? "Procesando..." : "Pagar con monedero"
        }
      )
    ] }) : method === "bizum" ? /* @__PURE__ */ jsxs("div", { className: styles$4.confirmView, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$4.bizumInfo, children: [
        /* @__PURE__ */ jsxs("div", { className: styles$4.bizumPhone, children: [
          /* @__PURE__ */ jsx(IoPhonePortraitOutline, { size: 28 }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: styles$4.bizumLabel, children: "Envía por Bizum a:" }),
            /* @__PURE__ */ jsx("span", { className: styles$4.bizumNumber, children: bizumPhone })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$4.bizumAmount, children: [
          /* @__PURE__ */ jsx("span", { children: "Importe exacto:" }),
          /* @__PURE__ */ jsxs("span", { className: styles$4.bizumTotal, children: [
            total.toFixed(2),
            " €"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$4.bizumSteps, children: [
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("strong", { children: "1." }),
            " Abre tu app de banco"
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("strong", { children: "2." }),
            " Envía ",
            total.toFixed(2),
            " € por Bizum al ",
            bizumPhone
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("strong", { children: "3." }),
            ' Pulsa "Confirmar pago"'
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "btn btn-primary btn-lg",
          style: { width: "100%" },
          onClick: () => handleConfirm("bizum"),
          disabled: processing,
          children: processing ? "Procesando..." : "Confirmar pago"
        }
      )
    ] }) : /* @__PURE__ */ jsxs("div", { className: styles$4.confirmView, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$4.totalDisplay, children: [
        /* @__PURE__ */ jsx("span", { children: "Total a pagar" }),
        /* @__PURE__ */ jsxs("span", { className: styles$4.totalAmount, children: [
          total.toFixed(2),
          " €"
        ] })
      ] }),
      method === "cash" ? /* @__PURE__ */ jsx("p", { className: styles$4.cashNote, children: "Acércate a caja o espera a que el camarero venga a la mesa." }) : /* @__PURE__ */ jsx("p", { className: styles$4.cashNote, children: "El camarero traerá el datáfono a tu mesa." }),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "btn btn-primary btn-lg",
          style: { width: "100%" },
          onClick: () => handleConfirm(method),
          disabled: processing,
          children: processing ? "Procesando..." : method === "card" ? "Solicitar datáfono" : "Solicitar cobro en efectivo"
        }
      )
    ] })
  ] }) });
}

function MyTickets({ isOpen, onClose }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const [sendingAll, setSendingAll] = useState(false);
  const user = useUserStore((s) => s.user);
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    getMyTickets().then((data) => setTickets(data)).catch(console.error).finally(() => setLoading(false));
  }, [isOpen]);
  if (!isOpen) return null;
  const userEmail = user?.email || "";
  const userName = user?.name || "Cliente";
  const handleSendOne = async (ticket) => {
    if (!userEmail) {
      toast.error("Inicia sesión con email para enviar tickets");
      return;
    }
    setSendingId(ticket.id);
    try {
      await sendTicketEmail(userEmail, ticket);
      toast.success("📩 Ticket enviado a tu email", { duration: 3e3 });
    } catch {
      toast.error("Error al enviar el ticket");
    } finally {
      setSendingId(null);
    }
  };
  const handleSendAll = async () => {
    if (!userEmail) {
      toast.error("Inicia sesión con email para enviar tickets");
      return;
    }
    if (tickets.length === 0) return;
    setSendingAll(true);
    try {
      await sendAllTicketsEmail(userEmail, userName, tickets);
      toast.success(`📩 Resumen de ${tickets.length} tickets enviado a tu email`, { duration: 4e3 });
    } catch {
      toast.error("Error al enviar el resumen");
    } finally {
      setSendingAll(false);
    }
  };
  const methodLabels = {
    bizum: "Bizum",
    cash: "Efectivo",
    card: "Tarjeta",
    wallet: "Monedero",
    split: "Dividido"
  };
  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  return /* @__PURE__ */ jsx("div", { className: styles$5.overlay, onClick: onClose, children: /* @__PURE__ */ jsxs("div", { className: styles$5.panel, onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs("div", { className: styles$5.header, children: [
      /* @__PURE__ */ jsxs("h2", { className: styles$5.title, children: [
        /* @__PURE__ */ jsx(IoReceiptOutline, { size: 20 }),
        " Mis Tickets"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$5.headerActions, children: [
        tickets.length > 0 && userEmail && /* @__PURE__ */ jsxs(
          "button",
          {
            className: styles$5.sendAllBtn,
            onClick: handleSendAll,
            disabled: sendingAll,
            title: "Enviar resumen completo por email",
            children: [
              /* @__PURE__ */ jsx(IoMailUnreadOutline, { size: 16 }),
              sendingAll ? "Enviando..." : "Enviar todos"
            ]
          }
        ),
        /* @__PURE__ */ jsx("button", { className: styles$5.closeBtn, onClick: onClose, children: /* @__PURE__ */ jsx(IoCloseOutline, { size: 22 }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: styles$5.content, children: loading ? /* @__PURE__ */ jsx("div", { className: styles$5.loading, children: "Cargando tickets..." }) : tickets.length === 0 ? /* @__PURE__ */ jsxs("div", { className: styles$5.empty, children: [
      /* @__PURE__ */ jsx(IoReceiptOutline, { size: 40 }),
      /* @__PURE__ */ jsx("p", { children: "Aún no tienes tickets" }),
      /* @__PURE__ */ jsx("span", { children: "Tus recibos aparecerán aquí después de cada pedido" })
    ] }) : tickets.map((ticket) => /* @__PURE__ */ jsxs("div", { className: styles$5.ticket, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$5.ticketHeader, children: [
        /* @__PURE__ */ jsx("span", { className: styles$5.ticketDate, children: formatDate(ticket.created_at) }),
        /* @__PURE__ */ jsxs("div", { className: styles$5.ticketActions, children: [
          /* @__PURE__ */ jsx("span", { className: styles$5.ticketMethod, children: methodLabels[ticket.payment_method] || ticket.payment_method }),
          userEmail && /* @__PURE__ */ jsx(
            "button",
            {
              className: styles$5.emailBtn,
              onClick: () => handleSendOne(ticket),
              disabled: sendingId === ticket.id,
              title: "Enviar por email",
              children: /* @__PURE__ */ jsx(IoMailOutline, { size: 14 })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: styles$5.ticketItems, children: ticket.items.map((item, i) => /* @__PURE__ */ jsxs("div", { className: styles$5.ticketItem, children: [
        /* @__PURE__ */ jsxs("span", { children: [
          item.qty,
          "x ",
          item.name
        ] }),
        /* @__PURE__ */ jsxs("span", { children: [
          (item.price * item.qty).toFixed(2),
          " €"
        ] })
      ] }, i)) }),
      /* @__PURE__ */ jsxs("div", { className: styles$5.ticketTotal, children: [
        /* @__PURE__ */ jsx("span", { children: "Total" }),
        /* @__PURE__ */ jsxs("span", { children: [
          ticket.total.toFixed(2),
          " €"
        ] })
      ] })
    ] }, ticket.id)) })
  ] }) });
}

const STATUS_CONFIG = {
  pending: { label: "Pendiente", icon: /* @__PURE__ */ jsx(IoTimeOutline, {}), color: "#f59e0b" },
  preparing: { label: "Preparando", icon: /* @__PURE__ */ jsx(IoFlameOutline, {}), color: "#C9A84C" },
  served: { label: "Servido", icon: /* @__PURE__ */ jsx(IoCheckmarkDoneOutline, {}), color: "#3b82f6" },
  paid: { label: "Pagado", icon: /* @__PURE__ */ jsx(IoWalletOutline, {}), color: "#10b981" }
};
function OrderTracker({ isOpen, onClose, tableNumber }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    getMyOrders().then((data) => setOrders(data)).catch(console.error).finally(() => setLoading(false));
    const channel = subscribeToOrders(() => {
      getMyOrders().then((data) => setOrders(data)).catch(console.error);
    });
    return () => {
      channel.unsubscribe();
    };
  }, [isOpen]);
  if (!isOpen) return null;
  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  };
  const activeOrders = orders.filter((o) => o.status !== "paid");
  const pastOrders = orders.filter((o) => o.status === "paid").slice(0, 5);
  return /* @__PURE__ */ jsx("div", { className: styles$6.overlay, onClick: onClose, children: /* @__PURE__ */ jsxs("div", { className: styles$6.panel, onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs("div", { className: styles$6.header, children: [
      /* @__PURE__ */ jsx("h2", { className: styles$6.title, children: "Mis Pedidos" }),
      /* @__PURE__ */ jsx("button", { className: styles$6.closeBtn, onClick: onClose, children: /* @__PURE__ */ jsx(IoCloseOutline, { size: 22 }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: styles$6.content, children: loading ? /* @__PURE__ */ jsx("div", { className: styles$6.loading, children: "Cargando pedidos..." }) : orders.length === 0 ? /* @__PURE__ */ jsxs("div", { className: styles$6.empty, children: [
      /* @__PURE__ */ jsx(IoTimeOutline, { size: 40 }),
      /* @__PURE__ */ jsx("p", { children: "No tienes pedidos aún" }),
      /* @__PURE__ */ jsx("span", { children: "Cuando hagas un pedido, podrás seguir su estado aquí" })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      activeOrders.length > 0 && /* @__PURE__ */ jsxs("div", { className: styles$6.section, children: [
        /* @__PURE__ */ jsx("h3", { className: styles$6.sectionTitle, children: "Pedidos activos" }),
        activeOrders.map((order) => {
          const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
          return /* @__PURE__ */ jsxs("div", { className: styles$6.order, children: [
            /* @__PURE__ */ jsxs("div", { className: styles$6.orderHeader, children: [
              /* @__PURE__ */ jsx("span", { className: styles$6.orderTime, children: formatTime(order.created_at) }),
              /* @__PURE__ */ jsxs(
                "span",
                {
                  className: styles$6.status,
                  style: { background: `${config.color}15`, color: config.color },
                  children: [
                    config.icon,
                    " ",
                    config.label
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsx("div", { className: styles$6.progress, children: ["pending", "preparing", "served"].map((step, i) => {
              const stepIndex = ["pending", "preparing", "served"].indexOf(order.status);
              const isActive = i <= stepIndex;
              return /* @__PURE__ */ jsxs(
                "div",
                {
                  className: `${styles$6.progressStep} ${isActive ? styles$6.progressActive : ""}`,
                  style: { "--step-color": STATUS_CONFIG[step].color },
                  children: [
                    /* @__PURE__ */ jsx("div", { className: styles$6.progressDot }),
                    /* @__PURE__ */ jsx("span", { children: STATUS_CONFIG[step].label })
                  ]
                },
                step
              );
            }) }),
            /* @__PURE__ */ jsx("div", { className: styles$6.orderItems, children: order.items.map((item, i) => /* @__PURE__ */ jsxs("div", { className: styles$6.orderItem, children: [
              /* @__PURE__ */ jsxs("span", { children: [
                item.quantity,
                "x ",
                item.product_name
              ] }),
              /* @__PURE__ */ jsxs("span", { children: [
                (item.unit_price * item.quantity).toFixed(2),
                " €"
              ] })
            ] }, i)) }),
            /* @__PURE__ */ jsxs("div", { className: styles$6.orderTotal, children: [
              /* @__PURE__ */ jsx("span", { children: "Total" }),
              /* @__PURE__ */ jsxs("span", { children: [
                order.total.toFixed(2),
                " €"
              ] })
            ] })
          ] }, order.id);
        })
      ] }),
      pastOrders.length > 0 && /* @__PURE__ */ jsxs("div", { className: styles$6.section, children: [
        /* @__PURE__ */ jsx("h3", { className: styles$6.sectionTitle, children: "Pedidos anteriores" }),
        pastOrders.map((order) => /* @__PURE__ */ jsxs("div", { className: `${styles$6.order} ${styles$6.pastOrder}`, children: [
          /* @__PURE__ */ jsxs("div", { className: styles$6.orderHeader, children: [
            /* @__PURE__ */ jsx("span", { className: styles$6.orderTime, children: formatTime(order.created_at) }),
            /* @__PURE__ */ jsxs(
              "span",
              {
                className: styles$6.status,
                style: { background: "#10b98115", color: "#10b981" },
                children: [
                  /* @__PURE__ */ jsx(IoWalletOutline, {}),
                  " Pagado"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles$6.orderTotal, children: [
            /* @__PURE__ */ jsxs("span", { children: [
              order.items.length,
              " producto",
              order.items.length !== 1 ? "s" : ""
            ] }),
            /* @__PURE__ */ jsxs("span", { children: [
              order.total.toFixed(2),
              " €"
            ] })
          ] })
        ] }, order.id))
      ] }),
      tableNumber && /* @__PURE__ */ jsxs("div", { className: styles$6.section, children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            className: styles$6.shareBtn,
            onClick: () => setShowQR(!showQR),
            children: [
              /* @__PURE__ */ jsx(IoQrCodeOutline, { size: 18 }),
              showQR ? "Ocultar QR" : "Compartir mesa con QR"
            ]
          }
        ),
        showQR && /* @__PURE__ */ jsxs("div", { className: styles$6.qrCard, children: [
          /* @__PURE__ */ jsx(
            QRCodeSVG,
            {
              value: `${window.location.origin}/mesa/${tableNumber}`,
              size: 180,
              bgColor: "#ffffff",
              fgColor: "#0A0A0A",
              level: "M",
              includeMargin: true
            }
          ),
          /* @__PURE__ */ jsxs("p", { className: styles$6.qrLabel, children: [
            "Escanea para unirte a la Mesa ",
            tableNumber
          ] }),
          /* @__PURE__ */ jsx("span", { className: styles$6.qrHint, children: "Tus amigos podrán pedir y pagar desde su móvil" })
        ] })
      ] })
    ] }) })
  ] }) });
}

const PRESET_AMOUNTS = [5, 10, 20];
function Wallet({ isOpen, onClose }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const loadData = async () => {
    try {
      const [bal, txs] = await Promise.all([
        getWalletBalance(),
        getWalletTransactions()
      ]);
      setBalance(bal);
      setTransactions(txs);
    } catch (err) {
      console.error("Wallet load error:", err);
    }
  };
  useEffect(() => {
    if (isOpen) loadData();
  }, [isOpen]);
  const handleRecharge = async () => {
    const amount = selectedAmount || parseFloat(customAmount);
    if (!amount || amount <= 0) {
      toast.error("Introduce una cantidad válida");
      return;
    }
    setLoading(true);
    try {
      const newBalance = await rechargeWallet(amount);
      setBalance(newBalance);
      setSelectedAmount(null);
      setCustomAmount("");
      toast.success(`+${amount.toFixed(2)} € recargados en tu monedero`);
      await loadData();
    } catch (err) {
      toast.error(err?.message || "Error al recargar");
    } finally {
      setLoading(false);
    }
  };
  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  if (!isOpen) return null;
  const rechargeAmount = selectedAmount || parseFloat(customAmount) || 0;
  return /* @__PURE__ */ jsx("div", { className: styles$7.overlay, onClick: onClose, children: /* @__PURE__ */ jsxs("div", { className: styles$7.panel, onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs("div", { className: styles$7.header, children: [
      /* @__PURE__ */ jsx("h2", { className: styles$7.title, children: "Monedero ORDERLY" }),
      /* @__PURE__ */ jsx("button", { className: styles$7.closeBtn, onClick: onClose, children: /* @__PURE__ */ jsx(IoCloseOutline, { size: 22 }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$7.content, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$7.balanceCard, children: [
        /* @__PURE__ */ jsx("div", { className: styles$7.balanceLabel, children: "Saldo disponible" }),
        /* @__PURE__ */ jsxs("div", { className: styles$7.balanceAmount, children: [
          balance.toFixed(2),
          /* @__PURE__ */ jsx("span", { className: styles$7.balanceSuffix, children: "€" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: styles$7.sectionTitle, children: "Recargar saldo" }),
      /* @__PURE__ */ jsx("div", { className: styles$7.rechargeGrid, children: PRESET_AMOUNTS.map((amt) => /* @__PURE__ */ jsxs(
        "button",
        {
          className: `${styles$7.rechargeBtn} ${selectedAmount === amt ? styles$7.active : ""}`,
          onClick: () => {
            setSelectedAmount(amt);
            setCustomAmount("");
          },
          children: [
            amt,
            " €"
          ]
        },
        amt
      )) }),
      /* @__PURE__ */ jsxs("div", { className: styles$7.customRow, children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            className: styles$7.customInput,
            type: "number",
            min: "1",
            step: "0.5",
            placeholder: "Otra cantidad...",
            value: customAmount,
            onChange: (e) => {
              setCustomAmount(e.target.value);
              setSelectedAmount(null);
            }
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: styles$7.confirmRechargeBtn,
            disabled: loading || rechargeAmount <= 0,
            onClick: handleRecharge,
            children: loading ? "..." : `Recargar ${rechargeAmount > 0 ? rechargeAmount.toFixed(2) + " €" : ""}`
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$7.transactions, children: [
        /* @__PURE__ */ jsx("div", { className: styles$7.sectionTitle, children: "Historial" }),
        transactions.length === 0 ? /* @__PURE__ */ jsx("div", { className: styles$7.emptyTx, children: "Aún no tienes movimientos" }) : /* @__PURE__ */ jsx("div", { className: styles$7.txList, children: transactions.map((tx) => /* @__PURE__ */ jsxs("div", { className: styles$7.tx, children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: `${styles$7.txIcon} ${tx.type === "recharge" ? styles$7.txRecharge : styles$7.txPayment}`,
              children: tx.type === "recharge" ? /* @__PURE__ */ jsx(IoArrowDownCircleOutline, { size: 20 }) : /* @__PURE__ */ jsx(IoArrowUpCircleOutline, { size: 20 })
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: styles$7.txInfo, children: [
            /* @__PURE__ */ jsx("span", { className: styles$7.txDesc, children: tx.description }),
            /* @__PURE__ */ jsx("span", { className: styles$7.txDate, children: formatDate(tx.created_at) })
          ] }),
          /* @__PURE__ */ jsxs(
            "span",
            {
              className: `${styles$7.txAmount} ${tx.type === "recharge" ? styles$7.txAmountPositive : styles$7.txAmountNegative}`,
              children: [
                tx.type === "recharge" ? "+" : "-",
                tx.amount.toFixed(2),
                " €"
              ]
            }
          )
        ] }, tx.id)) })
      ] })
    ] })
  ] }) });
}

const QUICK_ACTIONS = [
  "¿Qué me recomiendas?",
  "Algo frío",
  "Algo dulce",
  "Sin cafeína",
  "Sin lactosa",
  "Sin gluten",
  "Soy vegetariano",
  "Cachimba popular",
  "Para compartir"
];
const ALLERGEN_KEYWORDS = {
  "gluten": ["gluten"],
  "celíaco": ["gluten"],
  "celiaco": ["gluten"],
  "sin gluten": ["gluten"],
  "trigo": ["gluten"],
  "leche": ["lacteos"],
  "lácteo": ["lacteos"],
  "lacteo": ["lacteos"],
  "lactosa": ["lacteos"],
  "sin lactosa": ["lacteos"],
  "intolerante a la lactosa": ["lacteos"],
  "huevo": ["huevos"],
  "huevos": ["huevos"],
  "pescado": ["pescado"],
  "marisco": ["crustaceos", "moluscos"],
  "crustáceo": ["crustaceos"],
  "crustaceo": ["crustaceos"],
  "gamba": ["crustaceos"],
  "langostino": ["crustaceos"],
  "cacahuete": ["cacahuetes"],
  "cacahuetes": ["cacahuetes"],
  "soja": ["soja"],
  "frutos secos": ["frutos_cascara"],
  "nuez": ["frutos_cascara"],
  "nueces": ["frutos_cascara"],
  "almendra": ["frutos_cascara"],
  "avellana": ["frutos_cascara"],
  "apio": ["apio"],
  "mostaza": ["mostaza"],
  "sésamo": ["sesamo"],
  "sesamo": ["sesamo"],
  "sulfito": ["sulfitos"],
  "sulfitos": ["sulfitos"],
  "altramuz": ["altramuces"],
  "altramuces": ["altramuces"],
  "molusco": ["moluscos"],
  "moluscos": ["moluscos"]
};
const DIET_FILTERS = {
  "vegetariano": {
    excludeAllergens: ["pescado", "crustaceos", "moluscos"],
    text: "🌿 Como vegetariano, estos productos son aptos para ti:"
  },
  "vegetariana": {
    excludeAllergens: ["pescado", "crustaceos", "moluscos"],
    text: "🌿 Como vegetariana, estos productos son aptos para ti:"
  },
  "vegano": {
    excludeAllergens: ["lacteos", "huevos", "pescado", "crustaceos", "moluscos"],
    text: "🌱 Como vegano, estos productos son aptos para ti:"
  },
  "vegana": {
    excludeAllergens: ["lacteos", "huevos", "pescado", "crustaceos", "moluscos"],
    text: "🌱 Como vegana, estos productos son aptos para ti:"
  }
};
const MEAT_KEYWORDS = ["jamón", "jamon", "pollo", "bikini", "salmón", "salmon"];
function filterProductsWithoutAllergens(products, allergens) {
  return products.filter((p) => {
    if (!p.available) return false;
    const productAllergens = p.allergens || [];
    return !allergens.some((a) => productAllergens.includes(a));
  });
}
function filterForDiet(products, diet) {
  const filter = DIET_FILTERS[diet];
  if (!filter) return [];
  return products.filter((p) => {
    if (!p.available) return false;
    const productAllergens = p.allergens || [];
    if (filter.excludeAllergens.some((a) => productAllergens.includes(a))) return false;
    const name = p.name.toLowerCase();
    if (MEAT_KEYWORDS.some((k) => name.includes(k))) return false;
    return true;
  });
}
function findSpecificProduct(query, products) {
  const q = query.toLowerCase();
  const available = products.filter((p) => p.available);
  for (const p of available) {
    const name = p.name.toLowerCase();
    if (q.includes(name) || name.split(" ").every((w) => w.length > 2 && q.includes(w))) {
      return p;
    }
  }
  for (const p of available) {
    const words = p.name.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const matches = words.filter((w) => q.includes(w));
    if (matches.length >= 2 || words.length === 1 && matches.length === 1) {
      return p;
    }
  }
  return null;
}
function findProducts(query, products, activeCategoryId, categories) {
  const q = query.toLowerCase();
  const tagMap = {
    "frío": ["cold", "fresh"],
    "frio": ["cold", "fresh"],
    "caliente": ["hot"],
    "dulce": ["sweet"],
    "salado": ["salty"],
    "saludable": ["healthy"],
    "energía": ["energizing"],
    "energia": ["energizing"],
    "relajante": ["relaxing"],
    "cachimba": ["hookah"],
    "hookah": ["hookah"],
    "café": ["energizing"],
    "cafe": ["energizing"],
    "chocolate": ["chocolate"],
    "fruta": ["fruity"],
    "tropical": ["tropical"],
    "compartir": ["sharing"],
    "especial": ["special"],
    "popular": ["popular"],
    "sin cafeína": ["relaxing", "healthy"],
    "sin cafeina": ["relaxing", "healthy"],
    "cremoso": ["creamy"],
    "picante": ["spicy"]
  };
  let targetCategoryId = null;
  const catKeywords = {
    "cachimba": "Cachimbas",
    "shisha": "Cachimbas",
    "hookah": "Cachimbas",
    "café": "Cafés",
    "cafe": "Cafés",
    "batido": "Batidos y smoothies",
    "smoothie": "Batidos y smoothies",
    "tosta": "Tostas y salados",
    "bollería": "Bollería y dulces",
    "bolleria": "Bollería y dulces",
    "dulce": "Bollería y dulces",
    "té": "Tés e infusiones",
    "te ": "Tés e infusiones",
    "infusión": "Tés e infusiones",
    "infusion": "Tés e infusiones"
  };
  for (const [kw, catName] of Object.entries(catKeywords)) {
    if (q.includes(kw)) {
      const cat = categories.find((c) => c.name === catName);
      if (cat) targetCategoryId = cat.id;
      break;
    }
  }
  const baseProducts = targetCategoryId ? products.filter((p) => p.category_id === targetCategoryId) : products;
  let matchTags = [];
  for (const [keyword, tags] of Object.entries(tagMap)) {
    if (q.includes(keyword)) {
      matchTags.push(...tags);
    }
  }
  if (matchTags.length === 0) {
    const nameMatches = baseProducts.filter(
      (p) => p.available && (p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q))
    );
    if (nameMatches.length > 0) return nameMatches.slice(0, 5);
    if (targetCategoryId) {
      const catProducts = baseProducts.filter((p) => p.available);
      return catProducts.slice(0, 5);
    }
    const isGenericQuery = q.includes("recomienda") || q.includes("sugieres") || q.includes("qué pido") || q.includes("que pido");
    if (isGenericQuery && activeCategoryId) {
      const catProducts = products.filter((p) => p.available && p.category_id === activeCategoryId);
      if (catProducts.length > 0) {
        const shuffled2 = [...catProducts].sort(() => Math.random() - 0.5);
        return shuffled2.slice(0, 4);
      }
    }
    const avail = products.filter((p) => p.available);
    const shuffled = [...avail].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  }
  const scored = baseProducts.filter((p) => p.available).map((p) => {
    const tags = p.tags || [];
    const score = matchTags.filter((t) => tags.includes(t)).length;
    return { product: p, score };
  }).filter((s) => s.score > 0).sort((a, b) => b.score - a.score);
  if (scored.length > 0) {
    return scored.slice(0, 5).map((s) => s.product);
  }
  if (targetCategoryId) {
    return baseProducts.filter((p) => p.available).slice(0, 5);
  }
  return [];
}
function formatAllergenList(allergens) {
  return allergens.map((a) => `${ALLERGEN_INFO[a]?.icon || "⚠️"} ${ALLERGEN_INFO[a]?.label || a}`).join(", ");
}
function generateBotResponse(query, products, activeCategoryId, categories) {
  const q = query.toLowerCase();
  const isProductAllergenQuery = (q.includes("tiene") || q.includes("lleva") || q.includes("contiene") || q.includes("alérgeno") || q.includes("alergeno")) && !q.includes("no puedo") && !q.includes("alérgic") && !q.includes("alergic");
  if (isProductAllergenQuery) {
    const product = findSpecificProduct(q, products);
    if (product) {
      const allergens = product.allergens || [];
      if (allergens.length > 0) {
        return {
          text: `El "${product.name}" contiene: ${formatAllergenList(allergens)}. Ten cuidado si eres alérgico a alguno de estos.`,
          suggested: [product]
        };
      }
      return {
        text: `El "${product.name}" no tiene alérgenos registrados. Aun así te recomendamos consultarlo con el personal si tienes alergias severas.`,
        suggested: [product]
      };
    }
  }
  const isAllergyQuery = q.includes("alérgic") || q.includes("alergic") || q.includes("alergia") || q.includes("intolerante") || q.includes("intolerancia") || q.includes("no puedo") || q.includes("sin ") || q.includes("tiene") && (q.includes("gluten") || q.includes("lactosa") || q.includes("huevo"));
  for (const [diet, filter] of Object.entries(DIET_FILTERS)) {
    if (q.includes(diet)) {
      const safeProducts = filterForDiet(products, diet);
      if (safeProducts.length > 0) {
        return {
          text: filter.text,
          suggested: safeProducts.slice(0, 6)
        };
      }
      return {
        text: `Lo siento, no he encontrado productos para dieta ${diet} en nuestra carta. Consulta con el personal. 😊`,
        suggested: []
      };
    }
  }
  if (isAllergyQuery) {
    const detectedAllergens = [];
    for (const [keyword, allergenIds] of Object.entries(ALLERGEN_KEYWORDS)) {
      if (q.includes(keyword)) {
        allergenIds.forEach((a) => {
          if (!detectedAllergens.includes(a)) detectedAllergens.push(a);
        });
      }
    }
    if (detectedAllergens.length > 0) {
      const safeProducts = filterProductsWithoutAllergens(products, detectedAllergens);
      const allergenNames = formatAllergenList(detectedAllergens);
      const unsafeProducts = products.filter(
        (p) => p.available && (p.allergens || []).some((a) => detectedAllergens.includes(a))
      );
      const warningText = unsafeProducts.length > 0 ? `

Evita: ${unsafeProducts.map((p) => p.name).slice(0, 5).join(", ")}${unsafeProducts.length > 5 ? "..." : ""}` : "";
      if (safeProducts.length > 0) {
        return {
          text: `He filtrado productos sin ${allergenNames}. Estos son aptos para ti ✅${warningText}`,
          suggested: safeProducts.slice(0, 6)
        };
      }
      return {
        text: `No he encontrado productos sin ${allergenNames} en la carta. Te recomiendo consultar con nuestro personal. 🙏`,
        suggested: []
      };
    }
  }
  const suggested = findProducts(q, products, activeCategoryId, categories);
  const activeCatName = categories.find((c) => c.id === activeCategoryId)?.name || "";
  if (q.includes("recomienda") || q.includes("sugieres") || q.includes("qué pido") || q.includes("que pido")) {
    const catContext = activeCatName ? ` de ${activeCatName}` : "";
    return {
      text: `¡Te recomiendo estos productos${catContext}! 🌟`,
      suggested
    };
  }
  if (q.includes("frío") || q.includes("frio") || q.includes("refrescante")) {
    return {
      text: "Para refrescarte te propongo esto 🧊",
      suggested
    };
  }
  if (q.includes("dulce") || q.includes("postre") || q.includes("tarta")) {
    return {
      text: "Si te apetece algo dulce, mira estas opciones 🍰",
      suggested
    };
  }
  if (q.includes("cachimba") || q.includes("hookah") || q.includes("shisha")) {
    return {
      text: "Estas son nuestras cachimbas más populares 💨",
      suggested
    };
  }
  if (q.includes("compartir") || q.includes("grupo") || q.includes("amigos")) {
    return {
      text: "Para compartir entre amigos, te recomiendo 👫",
      suggested
    };
  }
  if (q.includes("sin cafeína") || q.includes("sin cafeina") || q.includes("descafeinado")) {
    return {
      text: "Sin cafeína pero igual de ricos, prueba estos 🌿",
      suggested
    };
  }
  if (q.includes("hola") || q.includes("buenas") || q.includes("hey")) {
    return {
      text: "¡Hola! 👋 Soy el asistente de ORDERLY. Puedo recomendarte bebidas, comida o cachimbas. También puedo filtrar por alergias o dietas. ¿Qué te apetece?",
      suggested: []
    };
  }
  if (q.includes("gracias") || q.includes("perfecto") || q.includes("genial")) {
    return {
      text: "¡De nada! Si necesitas algo más, aquí estoy 😊",
      suggested: []
    };
  }
  if (q.includes("precio") || q.includes("cuánto") || q.includes("cuanto") || q.includes("cuesta")) {
    const product = findSpecificProduct(q, products);
    if (product) {
      return {
        text: `"${product.name}" cuesta ${product.price.toFixed(2)} €.`,
        suggested: [product]
      };
    }
    return {
      text: "Puedes ver los precios en el menú. ¿Quieres que te recomiende algo en concreto?",
      suggested: []
    };
  }
  if (q.includes("cafeina") || q.includes("cafeína") || q.includes("energía") || q.includes("energia")) {
    return {
      text: "Para darte un boost de energía, prueba esto ⚡",
      suggested
    };
  }
  if (suggested.length > 0) {
    return {
      text: "Mira lo que he encontrado para ti 👀",
      suggested
    };
  }
  return {
    text: 'No estoy seguro de qué buscas. Prueba a decirme algo como "algo frío", "dulce", "cachimba", "sin gluten", "soy vegetariano" o "sin cafeína" 😊',
    suggested: []
  };
}
function Chatbot({ products, categories, activeCategory }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const addItem = useCartStore((s) => s.addItem);
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "bot",
          text: "¡Hola! 👋 Soy el asistente de ORDERLY. Puedo ayudarte a elegir qué pedir, filtrar por alergias y dietas, o decirte qué alérgenos tiene cada producto. Dime qué te apetece.",
          timestamp: /* @__PURE__ */ new Date()
        }
      ]);
    }
  }, []);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);
  const sendMessage = (text) => {
    if (!text.trim()) return;
    const userMsg = {
      id: crypto.randomUUID(),
      role: "user",
      text: text.trim(),
      timestamp: /* @__PURE__ */ new Date()
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const { text: botText, suggested } = generateBotResponse(text, products, activeCategory, categories);
      const botMsg = {
        id: crypto.randomUUID(),
        role: "bot",
        text: botText,
        products: suggested,
        timestamp: /* @__PURE__ */ new Date()
      };
      setMessages((prev) => [...prev, botMsg]);
      setTyping(false);
    }, 600 + Math.random() * 800);
  };
  const handleAddProduct = (product) => {
    addItem(product);
    const allergenWarning = product.allergens && product.allergens.length > 0 ? `
Contiene: ${formatAllergenList(product.allergens)}` : "";
    const confirmMsg = {
      id: crypto.randomUUID(),
      role: "bot",
      text: `✅ He añadido "${product.name}" a tu pedido.${allergenWarning} ¿Algo más?`,
      timestamp: /* @__PURE__ */ new Date()
    };
    setMessages((prev) => [...prev, confirmMsg]);
  };
  if (!isOpen) {
    return /* @__PURE__ */ jsx("button", { className: styles$8.fab, onClick: () => setIsOpen(true), title: "Asistente ORDERLY", children: /* @__PURE__ */ jsx(IoChatbubbleEllipsesOutline, { size: 24 }) });
  }
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("div", { className: styles$8.overlay, children: /* @__PURE__ */ jsxs("div", { className: styles$8.panel, children: [
    /* @__PURE__ */ jsxs("div", { className: styles$8.header, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$8.headerInfo, children: [
        /* @__PURE__ */ jsx("div", { className: styles$8.avatar, children: "🍽️" }),
        /* @__PURE__ */ jsxs("div", { className: styles$8.headerText, children: [
          /* @__PURE__ */ jsx("h3", { children: "Asistente ORDERLY" }),
          /* @__PURE__ */ jsx("span", { children: "Siempre disponible" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("button", { className: styles$8.closeBtn, onClick: () => setIsOpen(false), children: /* @__PURE__ */ jsx(IoClose, { size: 18 }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$8.messages, children: [
      messages.map((msg) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: `${styles$8.message} ${msg.role === "bot" ? styles$8.messageBot : styles$8.messageUser}`,
          children: [
            /* @__PURE__ */ jsx("div", { className: styles$8.bubble, children: msg.text }),
            msg.products && msg.products.length > 0 && /* @__PURE__ */ jsx("div", { className: styles$8.productSuggestions, children: msg.products.map((p) => /* @__PURE__ */ jsxs(
              "button",
              {
                className: styles$8.suggestionCard,
                onClick: () => handleAddProduct(p),
                children: [
                  p.image_url && /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: p.image_url,
                      alt: p.name,
                      className: styles$8.suggestionImg
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: styles$8.suggestionInfo, children: [
                    /* @__PURE__ */ jsx("span", { className: styles$8.suggestionName, children: p.name }),
                    /* @__PURE__ */ jsxs("span", { className: styles$8.suggestionPrice, children: [
                      p.price.toFixed(2),
                      " €"
                    ] }),
                    p.allergens && p.allergens.length > 0 && /* @__PURE__ */ jsx("span", { className: styles$8.suggestionAllergens, children: p.allergens.map((a) => ALLERGEN_INFO[a]?.icon || "⚠️").join(" ") })
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: styles$8.addTag, children: "+ Añadir" })
                ]
              },
              p.id
            )) })
          ]
        },
        msg.id
      )),
      typing && /* @__PURE__ */ jsx("div", { className: `${styles$8.message} ${styles$8.messageBot}`, children: /* @__PURE__ */ jsxs("div", { className: `${styles$8.bubble} ${styles$8.typing}`, children: [
        /* @__PURE__ */ jsx("span", { className: styles$8.typingDot }),
        /* @__PURE__ */ jsx("span", { className: styles$8.typingDot }),
        /* @__PURE__ */ jsx("span", { className: styles$8.typingDot })
      ] }) }),
      /* @__PURE__ */ jsx("div", { ref: messagesEndRef })
    ] }),
    /* @__PURE__ */ jsx("div", { className: styles$8.quickActions, children: QUICK_ACTIONS.map((action) => /* @__PURE__ */ jsx(
      "button",
      {
        className: styles$8.quickBtn,
        onClick: () => sendMessage(action),
        children: action
      },
      action
    )) }),
    /* @__PURE__ */ jsxs("div", { className: styles$8.inputBar, children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          className: styles$8.input,
          value: input,
          onChange: (e) => setInput(e.target.value),
          onKeyDown: (e) => e.key === "Enter" && sendMessage(input),
          placeholder: "Escribe tu pregunta..."
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: styles$8.sendBtn,
          onClick: () => sendMessage(input),
          disabled: !input.trim(),
          children: /* @__PURE__ */ jsx(IoSendOutline, { size: 16 })
        }
      )
    ] })
  ] }) }) });
}

function SplitPayment({ isOpen, onClose, onComplete, tableNumber, unpaidOrders, settings }) {
  const user = useUserStore((s) => s.user);
  const [splitCount, setSplitCount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [payerName, setPayerName] = useState(user?.name || "");
  const [method, setMethod] = useState("");
  const [paying, setPaying] = useState(false);
  const [partials, setPartials] = useState([]);
  const total = unpaidOrders.reduce((s, o) => s + o.total, 0);
  const paidSoFar = partials.reduce((s, p) => s + p.amount, 0);
  const remaining = Math.max(0, Math.round((total - paidSoFar) * 100) / 100);
  useEffect(() => {
    if (isOpen) {
      loadPartials();
      setPayerName(user?.name || "");
    }
  }, [isOpen, user]);
  const loadPartials = async () => {
    const data = await getPartialPayments(tableNumber);
    setPartials(data);
  };
  const myAmount = splitCount ? Math.round(total / splitCount * 100) / 100 : parseFloat(customAmount) || 0;
  const handlePay = async () => {
    if (!method) {
      toast.error("Selecciona un método de pago");
      return;
    }
    if (myAmount <= 0) {
      toast.error("Introduce una cantidad válida");
      return;
    }
    if (myAmount > remaining) {
      toast.error("La cantidad excede lo pendiente");
      return;
    }
    setPaying(true);
    try {
      if (method === "wallet") {
        await payWithWallet(myAmount, `Pago parcial Mesa ${tableNumber}`);
      }
      if (myAmount >= remaining - 0.01) {
        const orderIds = unpaidOrders.map((o) => o.id);
        await payOrders(orderIds, "split", tableNumber);
        toast.success("¡Cuenta completada! Todos los pedidos pagados 🎉");
        onComplete();
      } else {
        await payPartial(tableNumber, myAmount, method, payerName || "Anónimo");
        toast.success(`Pago parcial de ${myAmount.toFixed(2)} € registrado`);
        await loadPartials();
      }
    } catch (err) {
      toast.error(err.message || "Error al procesar el pago");
    } finally {
      setPaying(false);
    }
  };
  if (!isOpen) return null;
  const allPaid = remaining <= 0.01 && partials.length > 0;
  return /* @__PURE__ */ jsx("div", { className: styles$9.overlay, onClick: onClose, children: /* @__PURE__ */ jsxs("div", { className: styles$9.panel, onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs("div", { className: styles$9.header, children: [
      /* @__PURE__ */ jsx("h2", { className: styles$9.title, children: "Dividir cuenta" }),
      /* @__PURE__ */ jsx("button", { className: styles$9.closeBtn, onClick: onClose, children: /* @__PURE__ */ jsx(IoCloseOutline, { size: 20 }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$9.totalCard, children: [
      /* @__PURE__ */ jsx("div", { className: styles$9.totalLabel, children: "Total de la mesa" }),
      /* @__PURE__ */ jsxs("div", { className: styles$9.totalAmount, children: [
        total.toFixed(2),
        " €"
      ] }),
      paidSoFar > 0 && /* @__PURE__ */ jsxs("div", { className: styles$9.remaining, children: [
        "Pagado: ",
        paidSoFar.toFixed(2),
        " € — Queda: ",
        remaining.toFixed(2),
        " €"
      ] })
    ] }),
    partials.length > 0 && /* @__PURE__ */ jsxs("div", { className: styles$9.section, children: [
      /* @__PURE__ */ jsx("div", { className: styles$9.sectionTitle, children: "Pagos realizados" }),
      /* @__PURE__ */ jsx("div", { className: styles$9.payments, children: partials.map((p) => /* @__PURE__ */ jsxs("div", { className: styles$9.paymentRow, children: [
        /* @__PURE__ */ jsx("span", { className: styles$9.paymentName, children: p.payer_name }),
        /* @__PURE__ */ jsxs("span", { className: styles$9.paymentAmount, children: [
          p.amount.toFixed(2),
          " €"
        ] }),
        /* @__PURE__ */ jsx("span", { className: styles$9.paymentMethod, children: p.payment_method })
      ] }, p.id)) })
    ] }),
    allPaid ? /* @__PURE__ */ jsx("div", { className: styles$9.completeBanner, children: "✅ ¡Cuenta completamente pagada!" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: styles$9.section, children: [
        /* @__PURE__ */ jsx("div", { className: styles$9.sectionTitle, children: "Dividir entre personas" }),
        /* @__PURE__ */ jsxs("div", { className: styles$9.splitOptions, children: [
          [2, 3, 4, 5, 6].map((n) => /* @__PURE__ */ jsxs(
            "button",
            {
              className: `${styles$9.splitOption} ${splitCount === n ? styles$9.splitOptionActive : ""}`,
              onClick: () => {
                setSplitCount(n);
                setCustomAmount("");
              },
              children: [
                /* @__PURE__ */ jsxs("div", { className: styles$9.splitOptionPeople, children: [
                  n,
                  " pers."
                ] }),
                /* @__PURE__ */ jsxs("div", { className: styles$9.splitOptionAmount, children: [
                  (remaining / n).toFixed(2),
                  " €"
                ] })
              ]
            },
            n
          )),
          /* @__PURE__ */ jsxs(
            "button",
            {
              className: `${styles$9.splitOption} ${splitCount === null && customAmount ? styles$9.splitOptionActive : ""}`,
              onClick: () => setSplitCount(null),
              children: [
                /* @__PURE__ */ jsx("div", { className: styles$9.splitOptionPeople, children: "Otro" }),
                /* @__PURE__ */ jsx("div", { className: styles$9.splitOptionAmount, children: "libre" })
              ]
            }
          )
        ] })
      ] }),
      splitCount === null && /* @__PURE__ */ jsx("div", { className: styles$9.customAmount, children: /* @__PURE__ */ jsx(
        "input",
        {
          className: styles$9.customInput,
          type: "number",
          min: "0.01",
          step: "0.01",
          max: remaining,
          placeholder: `Cantidad (max ${remaining.toFixed(2)} €)`,
          value: customAmount,
          onChange: (e) => setCustomAmount(e.target.value)
        }
      ) }),
      /* @__PURE__ */ jsx(
        "input",
        {
          className: styles$9.nameInput,
          type: "text",
          placeholder: "Tu nombre",
          value: payerName,
          onChange: (e) => setPayerName(e.target.value)
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: styles$9.section, children: [
        /* @__PURE__ */ jsx("div", { className: styles$9.sectionTitle, children: "Método de pago" }),
        /* @__PURE__ */ jsxs("div", { className: styles$9.methodBtns, children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              className: `${styles$9.methodBtn} ${method === "wallet" ? styles$9.methodBtnActive : ""}`,
              onClick: () => setMethod("wallet"),
              children: [
                /* @__PURE__ */ jsx("span", { className: styles$9.methodIcon, children: "💳" }),
                " Monedero ORDERLY"
              ]
            }
          ),
          settings.bizum_enabled !== "false" && /* @__PURE__ */ jsxs(
            "button",
            {
              className: `${styles$9.methodBtn} ${method === "bizum" ? styles$9.methodBtnActive : ""}`,
              onClick: () => setMethod("bizum"),
              children: [
                /* @__PURE__ */ jsx("span", { className: styles$9.methodIcon, children: "📱" }),
                " Bizum"
              ]
            }
          ),
          settings.cash_enabled !== "false" && /* @__PURE__ */ jsxs(
            "button",
            {
              className: `${styles$9.methodBtn} ${method === "cash" ? styles$9.methodBtnActive : ""}`,
              onClick: () => setMethod("cash"),
              children: [
                /* @__PURE__ */ jsx("span", { className: styles$9.methodIcon, children: "💶" }),
                " Efectivo"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              className: `${styles$9.methodBtn} ${method === "card" ? styles$9.methodBtnActive : ""}`,
              onClick: () => setMethod("card"),
              children: [
                /* @__PURE__ */ jsx("span", { className: styles$9.methodIcon, children: "💳" }),
                " Tarjeta (test)"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: styles$9.payBtn,
          onClick: handlePay,
          disabled: paying || myAmount <= 0 || !method,
          children: paying ? "Procesando..." : `Pagar ${myAmount.toFixed(2)} €`
        }
      )
    ] })
  ] }) });
}

function GroupPayment({ isOpen, onClose, onComplete, tableNumber, unpaidOrders }) {
  const user = useUserStore((s) => s.user);
  const [session, setSession] = useState(null);
  const [creating, setCreating] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payingVenue, setPayingVenue] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const [step, setStep] = useState("create");
  const total = unpaidOrders.reduce((s, o) => s + o.total, 0);
  useEffect(() => {
    if (isOpen) {
      getAdminSettings().then((s) => {
        setBaseUrl(s.base_url || window.location.origin);
      });
    }
  }, [isOpen]);
  const refreshSession = useCallback(async () => {
    if (!session) return;
    const updated = await getGroupSession(session.id);
    if (updated) setSession(updated);
  }, [session]);
  useEffect(() => {
    if (!session) return;
    const sub = subscribeToOrders(() => refreshSession());
    return () => sub.unsubscribe();
  }, [session, refreshSession]);
  const handleCreate = async () => {
    if (unpaidOrders.length === 0) return;
    setCreating(true);
    try {
      const orderIds = unpaidOrders.map((o) => o.id);
      const newSession = await createGroupSession(tableNumber, orderIds);
      setSession(newSession);
      setStep("qr");
      toast.success("Grupo creado. Comparte el QR con tus amigos.");
    } catch (err) {
      toast.error(err.message || "Error al crear el grupo");
    } finally {
      setCreating(false);
    }
  };
  const handleToggleClaim = async (item) => {
    if (!session || !user) return;
    try {
      let updated;
      if (item.claimed_by === user.id) {
        updated = await unclaimGroupItem(session.id, item.id);
      } else if (item.claimed_by === null) {
        updated = await claimGroupItem(session.id, item.id);
      } else {
        return;
      }
      setSession(updated);
    } catch (err) {
      toast.error(err.message || "Error al seleccionar el item");
    }
  };
  const handlePayShare = async () => {
    if (!session) return;
    setPaying(true);
    try {
      const updated = await payGroupShare(session.id);
      setSession(updated);
      toast.success("Tu parte ha sido pagada al monedero del anfitrion.");
    } catch (err) {
      toast.error(err.message || "Error al pagar");
    } finally {
      setPaying(false);
    }
  };
  const handlePayVenue = async () => {
    if (!session) return;
    setPayingVenue(true);
    try {
      await hostPayVenue(session.id);
      toast.success("Pago completado al local. Todos los pedidos pagados.");
      onComplete();
    } catch (err) {
      toast.error(err.message || "Error al pagar al local");
    } finally {
      setPayingVenue(false);
    }
  };
  if (!isOpen) return null;
  const isHost = session && user && session.host_user_id === user.id;
  const myMember = session?.members.find((m) => m.user_id === user?.id);
  const allMembersPaid = session?.members.every((m) => m.paid) || false;
  const myItems = session?.items.filter((i) => i.claimed_by === user?.id) || [];
  const myTotal = myItems.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const unclaimedItems = session?.items.filter((i) => i.claimed_by === null) || [];
  const groupUrl = session ? `${baseUrl}/grupo/${session.id}` : "";
  return /* @__PURE__ */ jsx("div", { className: styles$a.overlay, onClick: onClose, children: /* @__PURE__ */ jsxs("div", { className: styles$a.panel, onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs("div", { className: styles$a.header, children: [
      /* @__PURE__ */ jsx("h2", { className: styles$a.title, children: "Pago en grupo" }),
      /* @__PURE__ */ jsx("button", { className: styles$a.closeBtn, onClick: onClose, children: /* @__PURE__ */ jsx(IoCloseOutline, { size: 20 }) })
    ] }),
    step === "create" && !session && /* @__PURE__ */ jsxs("div", { className: styles$a.createSection, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$a.totalCard, children: [
        /* @__PURE__ */ jsx("div", { className: styles$a.totalLabel, children: "Total de la mesa" }),
        /* @__PURE__ */ jsxs("div", { className: styles$a.totalAmount, children: [
          total.toFixed(2),
          " EUR"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$a.stepsGuide, children: [
        /* @__PURE__ */ jsxs("div", { className: styles$a.stepGuide, children: [
          /* @__PURE__ */ jsx("span", { className: styles$a.stepNum, children: "1" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Se genera un QR" }),
            /* @__PURE__ */ jsx("p", { children: "Al crear el grupo, se genera un QR unico vinculado a esta comanda." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$a.stepGuide, children: [
          /* @__PURE__ */ jsx("span", { className: styles$a.stepNum, children: "2" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Cada comensal escanea" }),
            /* @__PURE__ */ jsx("p", { children: "Los demas escanean el QR y acceden al pedido compartido." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$a.stepGuide, children: [
          /* @__PURE__ */ jsx("span", { className: styles$a.stepNum, children: "3" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Selecciona lo tuyo" }),
            /* @__PURE__ */ jsx("p", { children: "Cada persona marca los platos que ha consumido." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$a.stepGuide, children: [
          /* @__PURE__ */ jsx("span", { className: styles$a.stepNum, children: "4" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Pago al anfitrion" }),
            /* @__PURE__ */ jsx("p", { children: "Cada comensal paga su parte al monedero del anfitrion." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$a.stepGuide, children: [
          /* @__PURE__ */ jsx("span", { className: styles$a.stepNum, children: "5" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Pago al local" }),
            /* @__PURE__ */ jsx("p", { children: "El anfitrion tramita el pago total al establecimiento." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: styles$a.createBtn,
          onClick: handleCreate,
          disabled: creating || unpaidOrders.length === 0,
          children: creating ? "Creando grupo..." : "Crear grupo y generar QR"
        }
      )
    ] }),
    step === "qr" && session && /* @__PURE__ */ jsxs("div", { className: styles$a.qrSection, children: [
      /* @__PURE__ */ jsx("p", { className: styles$a.qrLabel, children: "Comparte este QR con los comensales de tu mesa" }),
      /* @__PURE__ */ jsx("div", { className: styles$a.qrContainer, children: /* @__PURE__ */ jsx(
        QRCodeSVG,
        {
          value: groupUrl,
          size: 200,
          bgColor: "#ffffff",
          fgColor: "#0A0A0A",
          level: "M",
          includeMargin: true
        }
      ) }),
      /* @__PURE__ */ jsx("p", { className: styles$a.qrUrl, children: groupUrl }),
      /* @__PURE__ */ jsxs("div", { className: styles$a.membersRow, children: [
        /* @__PURE__ */ jsx(IoPersonOutline, { size: 16 }),
        /* @__PURE__ */ jsxs("span", { children: [
          session.members.length,
          " miembro",
          session.members.length > 1 ? "s" : "",
          " en el grupo"
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: styles$a.nextBtn,
          onClick: () => setStep("select"),
          children: "Continuar a seleccionar platos"
        }
      )
    ] }),
    step === "select" && session && /* @__PURE__ */ jsxs("div", { className: styles$a.selectSection, children: [
      /* @__PURE__ */ jsx("p", { className: styles$a.selectLabel, children: "Selecciona los platos que has consumido:" }),
      /* @__PURE__ */ jsx("div", { className: styles$a.itemsList, children: session.items.map((item) => {
        const isMine = item.claimed_by === user?.id;
        const isTaken = item.claimed_by !== null && !isMine;
        const claimedByName = isTaken ? session.members.find((m) => m.user_id === item.claimed_by)?.name || "Otro" : null;
        return /* @__PURE__ */ jsxs(
          "button",
          {
            className: `${styles$a.itemCard} ${isMine ? styles$a.itemMine : ""} ${isTaken ? styles$a.itemTaken : ""}`,
            onClick: () => handleToggleClaim(item),
            disabled: isTaken,
            children: [
              /* @__PURE__ */ jsxs("div", { className: styles$a.itemInfo, children: [
                /* @__PURE__ */ jsx("span", { className: styles$a.itemName, children: item.product_name }),
                /* @__PURE__ */ jsxs("span", { className: styles$a.itemPrice, children: [
                  item.unit_price.toFixed(2),
                  " EUR"
                ] })
              ] }),
              isMine && /* @__PURE__ */ jsx(IoCheckmarkCircle, { size: 20, className: styles$a.itemCheck }),
              isTaken && claimedByName && /* @__PURE__ */ jsx("span", { className: styles$a.itemClaimedBy, children: claimedByName })
            ]
          },
          item.id
        );
      }) }),
      unclaimedItems.length > 0 && /* @__PURE__ */ jsxs("div", { className: styles$a.warningBanner, children: [
        unclaimedItems.length,
        " plato",
        unclaimedItems.length > 1 ? "s" : "",
        " sin asignar"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$a.myTotal, children: [
        /* @__PURE__ */ jsx("span", { children: "Tu total:" }),
        /* @__PURE__ */ jsxs("strong", { children: [
          myTotal.toFixed(2),
          " EUR"
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: styles$a.nextBtn,
          onClick: () => setStep("pay"),
          disabled: myItems.length === 0,
          children: "Continuar al pago"
        }
      )
    ] }),
    step === "pay" && session && /* @__PURE__ */ jsxs("div", { className: styles$a.paySection, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$a.totalCard, children: [
        /* @__PURE__ */ jsx("div", { className: styles$a.totalLabel, children: "Tu parte" }),
        /* @__PURE__ */ jsxs("div", { className: styles$a.totalAmount, children: [
          myTotal.toFixed(2),
          " EUR"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$a.membersSection, children: [
        /* @__PURE__ */ jsx("div", { className: styles$a.sectionTitle, children: "Estado del grupo" }),
        session.members.map((m) => /* @__PURE__ */ jsxs("div", { className: styles$a.memberRow, children: [
          /* @__PURE__ */ jsxs("span", { className: styles$a.memberName, children: [
            m.name,
            m.user_id === session.host_user_id ? " (Anfitrion)" : ""
          ] }),
          /* @__PURE__ */ jsxs("span", { className: styles$a.memberAmount, children: [
            m.amount.toFixed(2),
            " EUR"
          ] }),
          m.paid ? /* @__PURE__ */ jsx("span", { className: styles$a.memberPaid, children: "Pagado" }) : /* @__PURE__ */ jsx("span", { className: styles$a.memberPending, children: "Pendiente" })
        ] }, m.user_id))
      ] }),
      !myMember?.paid && myTotal > 0 && /* @__PURE__ */ jsx(
        "button",
        {
          className: styles$a.payBtn,
          onClick: handlePayShare,
          disabled: paying,
          children: paying ? "Procesando..." : isHost ? `Confirmar mi parte (${myTotal.toFixed(2)} EUR)` : `Pagar ${myTotal.toFixed(2)} EUR al monedero del anfitrion`
        }
      ),
      myMember?.paid && /* @__PURE__ */ jsx("div", { className: styles$a.paidBanner, children: "Tu parte esta pagada" }),
      isHost && allMembersPaid && /* @__PURE__ */ jsx(
        "button",
        {
          className: styles$a.venuePayBtn,
          onClick: handlePayVenue,
          disabled: payingVenue,
          children: payingVenue ? "Procesando pago al local..." : `Pagar ${total.toFixed(2)} EUR al local`
        }
      ),
      isHost && !allMembersPaid && /* @__PURE__ */ jsx("div", { className: styles$a.waitingBanner, children: "Esperando a que todos los miembros paguen su parte..." })
    ] }),
    session && step !== "create" && /* @__PURE__ */ jsxs("div", { className: styles$a.stepNav, children: [
      step === "select" && /* @__PURE__ */ jsx("button", { className: styles$a.backBtn, onClick: () => setStep("qr"), children: "Volver al QR" }),
      step === "pay" && /* @__PURE__ */ jsx("button", { className: styles$a.backBtn, onClick: () => setStep("select"), children: "Volver a seleccionar" })
    ] })
  ] }) });
}

function MenuApp({ tableNumber }) {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const userLoading = useUserStore((s) => s.loading);
  const setUserLoading = useUserStore((s) => s.setLoading);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [ticketsOpen, setTicketsOpen] = useState(false);
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [splitOpen, setSplitOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [settings, setSettings] = useState({});
  const [unpaidOrders, setUnpaidOrders] = useState([]);
  const items = useCartStore((s) => s.items);
  useEffect(() => {
    async function checkAuth() {
      try {
        const existing = await getCurrentUser();
        if (existing) setUser(existing);
      } catch {
      }
      setUserLoading(false);
    }
    checkAuth();
  }, [setUser, setUserLoading]);
  useEffect(() => {
    if (!user && !userLoading) return;
    async function loadData() {
      try {
        const [cats, prods, setts] = await Promise.all([
          getCategories(),
          getProducts(),
          getAdminSettings()
        ]);
        setCategories(cats);
        setProducts(prods);
        setSettings(setts);
        if (cats.length > 0) setActiveCategory(cats[0].id);
      } catch (err) {
        console.error("Error loading data:", err);
        toast.error("Error al cargar el menú. Recarga la página.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, userLoading]);
  const refreshUnpaid = useCallback(async () => {
    try {
      const orders = await getUnpaidOrdersByTable(tableNumber);
      setUnpaidOrders(orders);
    } catch (err) {
      console.error("Error loading unpaid orders:", err);
    }
  }, [tableNumber]);
  useEffect(() => {
    refreshUnpaid();
    const channel = subscribeToOrders(() => {
      refreshUnpaid();
    });
    return () => channel.unsubscribe();
  }, [refreshUnpaid]);
  const filteredProducts = products.filter(
    (p) => p.category_id === activeCategory && p.available
  );
  const handleSendOrder = async () => {
    const cartItems = useCartStore.getState().items;
    if (cartItems.length === 0) return;
    setSending(true);
    try {
      await createOrder(tableNumber, cartItems);
      useCartStore.getState().clearCart();
      setCartOpen(false);
      toast.success("¡Pedido enviado! Lo prepararemos enseguida 🍵", { duration: 4e3 });
      await refreshUnpaid();
    } catch (err) {
      console.error("Order error:", err);
      toast.error("Error al enviar el pedido. Inténtalo de nuevo.");
    } finally {
      setSending(false);
    }
  };
  const unpaidTotal = unpaidOrders.reduce((s, o) => s + o.total, 0);
  const handlePaymentComplete = () => {
    setPaymentOpen(false);
    refreshUnpaid();
  };
  const handleCallWaiter = async () => {
    try {
      await createServiceRequest("solicitud_camarero", tableNumber);
      toast.success("🙋 Camarero notificado. Vendrá a tu mesa.", { duration: 4e3 });
    } catch (err) {
      console.error("Error calling waiter:", err);
      toast.error("Error al solicitar el camarero");
    }
  };
  if (userLoading || loading) {
    return /* @__PURE__ */ jsx("div", { className: styles$b.app, children: /* @__PURE__ */ jsxs("div", { className: styles$b.loadingScreen, children: [
      /* @__PURE__ */ jsx("div", { className: styles$b.loadingSpinner }),
      /* @__PURE__ */ jsx("p", { children: "Cargando menú..." })
    ] }) });
  }
  if (!user) {
    return /* @__PURE__ */ jsx("div", { className: styles$b.app, children: /* @__PURE__ */ jsx(
      AuthModal,
      {
        tableNumber,
        onAuthenticated: (u) => {
          setUser(u);
          toast.success(`¡Hola ${u.name}! Bienvenido a ORDERLY`, { duration: 3e3 });
        }
      }
    ) });
  }
  return /* @__PURE__ */ jsxs("div", { className: styles$b.app, children: [
    /* @__PURE__ */ jsx(
      Toaster,
      {
        position: "top-center",
        toastOptions: {
          style: {
            borderRadius: "12px",
            background: "#0A0A0A",
            color: "#fff",
            fontSize: "0.875rem"
          }
        }
      }
    ),
    /* @__PURE__ */ jsx(
      CustomerHeader,
      {
        tableNumber,
        userName: user?.name,
        onCartClick: () => setCartOpen(true),
        onTicketsClick: () => setTicketsOpen(true),
        onOrdersClick: () => setTrackerOpen(true),
        onWalletClick: () => setWalletOpen(true),
        onCallWaiter: handleCallWaiter,
        onLogout: () => {
          useUserStore.getState().logout();
          toast("Sesión cerrada", { icon: "👋" });
        }
      }
    ),
    /* @__PURE__ */ jsx(
      CategoryTabs,
      {
        categories,
        activeCategory,
        onSelect: setActiveCategory
      }
    ),
    /* @__PURE__ */ jsx("div", { className: styles$b.hero, children: /* @__PURE__ */ jsx("div", { className: styles$b.heroContent, children: /* @__PURE__ */ jsx("img", { src: "/header.png", alt: "ORDERLY banner", className: styles$b.heroBanner }) }) }),
    /* @__PURE__ */ jsxs("main", { className: styles$b.main, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$b.sectionHeader, children: [
        /* @__PURE__ */ jsx("h2", { className: styles$b.sectionTitle, children: categories.find((c) => c.id === activeCategory)?.name || "Menú" }),
        /* @__PURE__ */ jsxs("span", { className: styles$b.sectionCount, children: [
          filteredProducts.length,
          " productos"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: styles$b.grid, children: filteredProducts.map((product) => /* @__PURE__ */ jsx(ProductCard, { product }, product.id)) }),
      filteredProducts.length === 0 && /* @__PURE__ */ jsxs("div", { className: styles$b.empty, children: [
        /* @__PURE__ */ jsx("span", { className: styles$b.emptyIcon, children: "🍃" }),
        /* @__PURE__ */ jsx("p", { children: "No hay productos disponibles en esta categoría" })
      ] })
    ] }),
    items.length > 0 && !cartOpen && /* @__PURE__ */ jsx("div", { className: styles$b.floatingBar, children: /* @__PURE__ */ jsxs("button", { className: styles$b.floatingBtn, onClick: () => setCartOpen(true), children: [
      /* @__PURE__ */ jsxs("span", { children: [
        "Ver pedido (",
        items.reduce((s, i) => s + i.quantity, 0),
        ")"
      ] }),
      /* @__PURE__ */ jsxs("span", { className: styles$b.floatingTotal, children: [
        items.reduce((s, i) => s + i.product.price * i.quantity, 0).toFixed(2),
        " €"
      ] })
    ] }) }),
    unpaidOrders.length > 0 && items.length === 0 && !cartOpen && /* @__PURE__ */ jsxs("div", { className: styles$b.floatingBar, children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          className: `${styles$b.floatingBtn} ${styles$b.payBtn}`,
          onClick: () => setPaymentOpen(true),
          children: [
            /* @__PURE__ */ jsxs("span", { children: [
              "Pagar (",
              unpaidOrders.length,
              " pedido",
              unpaidOrders.length > 1 ? "s" : "",
              ")"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: styles$b.floatingTotal, children: [
              unpaidTotal.toFixed(2),
              " €"
            ] })
          ]
        }
      ),
      unpaidOrders.length > 0 && /* @__PURE__ */ jsx(
        "button",
        {
          className: `${styles$b.floatingBtn} ${styles$b.splitBtn}`,
          onClick: () => setGroupOpen(true),
          children: "Dividir cuenta"
        }
      )
    ] }),
    /* @__PURE__ */ jsx(
      Cart,
      {
        isOpen: cartOpen,
        onClose: () => setCartOpen(false),
        onCheckout: handleSendOrder,
        sending
      }
    ),
    /* @__PURE__ */ jsx(
      PaymentModal,
      {
        isOpen: paymentOpen,
        onClose: () => setPaymentOpen(false),
        onComplete: handlePaymentComplete,
        tableNumber,
        settings,
        unpaidOrders
      }
    ),
    /* @__PURE__ */ jsx(MyTickets, { isOpen: ticketsOpen, onClose: () => setTicketsOpen(false) }),
    /* @__PURE__ */ jsx(OrderTracker, { isOpen: trackerOpen, onClose: () => setTrackerOpen(false), tableNumber }),
    /* @__PURE__ */ jsx(Wallet, { isOpen: walletOpen, onClose: () => setWalletOpen(false) }),
    /* @__PURE__ */ jsx(
      SplitPayment,
      {
        isOpen: splitOpen,
        onClose: () => setSplitOpen(false),
        onComplete: () => {
          setSplitOpen(false);
          refreshUnpaid();
        },
        tableNumber,
        unpaidOrders,
        settings
      }
    ),
    /* @__PURE__ */ jsx(
      GroupPayment,
      {
        isOpen: groupOpen,
        onClose: () => setGroupOpen(false),
        onComplete: () => {
          setGroupOpen(false);
          refreshUnpaid();
        },
        tableNumber,
        unpaidOrders
      }
    ),
    /* @__PURE__ */ jsx(Chatbot, { products, categories, activeCategory }),
    /* @__PURE__ */ jsxs("footer", { className: styles$b.footer, children: [
      "Powered by ",
      /* @__PURE__ */ jsx("strong", { children: "ORDERLY" })
    ] })
  ] });
}

const $$Astro = createAstro();
const $$mesa = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$mesa;
  const { mesa } = Astro2.params;
  const tableNumber = parseInt(mesa || "0");
  if (!tableNumber || tableNumber < 1) {
    return Astro2.redirect("/");
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": `Mesa ${tableNumber} - ORDERLY` }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "MenuApp", MenuApp, { "client:load": true, "tableNumber": tableNumber, "client:component-hydration": "load", "client:component-path": "C:/Users/Usuario/Desktop/Tfg_EMA/src/components/customer/MenuApp", "client:component-export": "default" })} ` })}`;
}, "C:/Users/Usuario/Desktop/Tfg_EMA/src/pages/mesa/[mesa].astro", void 0);

const $$file = "C:/Users/Usuario/Desktop/Tfg_EMA/src/pages/mesa/[mesa].astro";
const $$url = "/mesa/[mesa]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$mesa,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
