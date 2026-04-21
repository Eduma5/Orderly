import { e as createComponent, k as renderComponent, r as renderTemplate } from '../chunks/astro/server_0IadgrTN.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_zzDEcozS.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { IoLockClosedOutline, IoCardOutline, IoCashOutline, IoCallOutline, IoPersonOutline, IoHourglassOutline, IoCheckmarkOutline, IoWalletOutline, IoRefreshOutline, IoHandRightOutline, IoCheckmarkDoneOutline, IoFlameOutline, IoTimeOutline, IoAddOutline, IoCreateOutline, IoTrashOutline, IoPrintOutline, IoDownloadOutline, IoReceiptOutline, IoTrendingDownOutline, IoTrendingUpOutline, IoCafeOutline, IoCalendarOutline, IoCloudUploadOutline, IoSaveOutline, IoLogOutOutline, IoStatsChartOutline, IoRestaurantOutline, IoGridOutline, IoQrCodeOutline, IoSettingsOutline } from 'react-icons/io5';
import { g as getAdminSettings, a as getOrders, b as getServiceRequests, s as subscribeToOrders, u as updateOrderStatus, c as updateServiceRequestStatus, p as payOrders, d as getCategories, e as getProducts, f as upsertProduct, h as deleteProduct, t as toggleProductAvailability, i as getTables, j as upsertTable, k as deleteTable, l as getPaidOrders, m as updateAdminSetting } from '../chunks/db_DD6f8SZr.mjs';
import { s as styles, a as styles$1, b as styles$2, c as styles$3, d as styles$4, e as styles$5, f as styles$6, g as styles$7 } from '../chunks/admin.30f82b17_DJTw8C4u.mjs';
import { A as ALLERGEN_INFO } from '../chunks/types_CO5ADS75.mjs';
import { QRCodeSVG } from 'qrcode.react';
export { renderers } from '../renderers.mjs';

function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const settings = await getAdminSettings();
      const adminPassword = settings.admin_password || "orderly2026";
      if (password === adminPassword) {
        localStorage.setItem("ema_admin", "true");
        onLogin();
      } else {
        setError("Contraseña incorrecta");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (password === "orderly2026") {
        localStorage.setItem("ema_admin", "true");
        onLogin();
      } else {
        setError("Error de conexión. Inténtalo de nuevo.");
      }
    }
    setLoading(false);
  };
  return /* @__PURE__ */ jsx("div", { className: styles.wrapper, children: /* @__PURE__ */ jsxs("form", { className: styles.form, onSubmit: handleSubmit, children: [
    /* @__PURE__ */ jsx("div", { className: styles.iconWrap, children: /* @__PURE__ */ jsx(IoLockClosedOutline, { size: 28 }) }),
    /* @__PURE__ */ jsx("h1", { className: styles.title, children: "Panel de Administración" }),
    /* @__PURE__ */ jsx("p", { className: styles.subtitle, children: "ORDERLY" }),
    error && /* @__PURE__ */ jsx("div", { className: styles.error, children: error }),
    /* @__PURE__ */ jsxs("div", { className: styles.field, children: [
      /* @__PURE__ */ jsx("label", { className: styles.label, children: "Contraseña" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "password",
          className: styles.input,
          value: password,
          onChange: (e) => setPassword(e.target.value),
          placeholder: "••••••••",
          required: true,
          autoFocus: true
        }
      )
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "submit",
        className: `btn btn-primary btn-lg ${styles.submitBtn}`,
        disabled: loading,
        children: loading ? "Entrando..." : "Iniciar sesión"
      }
    )
  ] }) });
}

const STATUS_CONFIG = {
  pending: { label: "Pendiente", icon: /* @__PURE__ */ jsx(IoTimeOutline, {}), color: "#f59e0b" },
  preparing: { label: "Preparando", icon: /* @__PURE__ */ jsx(IoFlameOutline, {}), color: "#C9A84C" },
  served: { label: "Servido", icon: /* @__PURE__ */ jsx(IoCheckmarkDoneOutline, {}), color: "#3b82f6" },
  ready_for_payment: { label: "Pago solicitado", icon: /* @__PURE__ */ jsx(IoHandRightOutline, {}), color: "#ef4444" },
  paid: { label: "Pagado", icon: /* @__PURE__ */ jsx(IoWalletOutline, {}), color: "#10b981" }
};
const NEXT_STATUS = {
  pending: "preparing",
  preparing: "served",
  served: "ready_for_payment",
  ready_for_payment: "paid"
};
const NEXT_LABEL = {
  pending: "Preparando",
  preparing: "Servido",
  served: "Listo para cobrar",
  ready_for_payment: "Cobrado"
};
function playNotificationSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    gain.gain.value = 0.12;
    osc.start();
    setTimeout(() => {
      osc.frequency.value = 1e3;
    }, 150);
    setTimeout(() => {
      osc.stop();
      ctx.close();
    }, 300);
  } catch {
  }
}
function playUrgentSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "square";
    osc.frequency.value = 600;
    gain.gain.value = 0.08;
    osc.start();
    setTimeout(() => {
      osc.frequency.value = 900;
    }, 100);
    setTimeout(() => {
      osc.frequency.value = 600;
    }, 200);
    setTimeout(() => {
      osc.frequency.value = 900;
    }, 300);
    setTimeout(() => {
      osc.stop();
      ctx.close();
    }, 400);
  } catch {
  }
}
function OrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [lastOrderCount, setLastOrderCount] = useState(null);
  const [serviceRequests, setServiceRequests] = useState([]);
  const lastRequestCountRef = useRef(0);
  const loadOrders = useCallback(async () => {
    try {
      const data = await getOrders();
      setOrders(data);
      return data.length;
    } catch (err) {
      console.error("Error loading orders:", err);
      return 0;
    } finally {
      setLoading(false);
    }
  }, []);
  const loadRequests = useCallback(async () => {
    try {
      const data = await getServiceRequests();
      const active = data.filter((r) => r.status !== "completed");
      setServiceRequests(active);
      return active.length;
    } catch (err) {
      console.error("Error loading service requests:", err);
      return 0;
    }
  }, []);
  useEffect(() => {
    loadOrders().then((count) => setLastOrderCount(count));
    loadRequests().then((count) => {
      lastRequestCountRef.current = count;
    });
    const channel = subscribeToOrders(async (payload) => {
      const newOrderCount = await loadOrders();
      const newReqCount = await loadRequests();
      if (payload.eventType === "BROADCAST" || payload.eventType === "STORAGE") {
        if (payload.event === "order_new" || lastOrderCount !== null && newOrderCount > lastOrderCount) {
          const tableNum = payload.data?.tableNumber;
          toast.success(
            `🔔 Nuevo pedido${tableNum ? ` — Mesa ${tableNum}` : ""}`,
            { duration: 5e3, icon: "🆕" }
          );
          playNotificationSound();
        }
        if (payload.event === "service_request_new" || newReqCount > lastRequestCountRef.current) {
          const data = payload.data || {};
          const typeLabel = data.type === "solicitud_pago" ? `💳 Solicitud de pago${data.method === "datafono" ? " (datáfono)" : data.method === "efectivo" ? " (efectivo)" : ""}` : "🙋 Solicitud de camarero";
          toast(
            `${typeLabel}
Mesa ${data.tableNumber || "?"}${data.userName ? ` — ${data.userName}` : ""}${data.total ? ` — ${data.total.toFixed(2)} €` : ""}`,
            { duration: 8e3, icon: "🚨", style: { background: "#fef3c7", border: "2px solid #f59e0b", fontWeight: 600 } }
          );
          playUrgentSound();
        }
        setLastOrderCount(newOrderCount);
        lastRequestCountRef.current = newReqCount;
      }
    });
    return () => {
      channel.unsubscribe();
    };
  }, [loadOrders, loadRequests]);
  const filteredOrders = filter === "all" ? orders.filter((o) => o.status !== "paid") : orders.filter((o) => o.status === filter);
  const advanceStatus = async (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    const nextStatus = NEXT_STATUS[order.status];
    if (!nextStatus) return;
    try {
      await updateOrderStatus(orderId, nextStatus, order.payment_method || void 0);
      if (nextStatus === "paid") {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        toast.success(`Pedido cobrado — Mesa ${order.table_number}`);
      } else {
        setOrders(
          (prev) => prev.map(
            (o) => o.id === orderId ? { ...o, status: nextStatus } : o
          )
        );
      }
    } catch (err) {
      console.error("Error updating order:", err);
      toast.error("Error al actualizar el pedido");
    }
  };
  const handleRequestAction = async (requestId, action) => {
    try {
      await updateServiceRequestStatus(requestId, action);
      if (action === "completed") {
        const req = serviceRequests.find((r) => r.id === requestId);
        if (req && req.type === "solicitud_pago" && req.order_ids && req.order_ids.length > 0) {
          const payMethod = req.method === "datafono" ? "card" : req.method === "efectivo" ? "cash" : "card";
          await payOrders(req.order_ids, payMethod, req.table_number);
          await loadOrders();
        }
        toast.success(`✅ Solicitud completada — Mesa ${serviceRequests.find((r) => r.id === requestId)?.table_number}`);
      } else {
        toast("Atendiendo solicitud...", { icon: "👨‍🍳" });
      }
      setServiceRequests(
        (prev) => action === "completed" ? prev.filter((r) => r.id !== requestId) : prev.map((r) => r.id === requestId ? { ...r, status: action } : r)
      );
    } catch (err) {
      console.error("Error updating service request:", err);
      toast.error("Error al actualizar la solicitud");
    }
  };
  const formatTime = (iso) => {
    const d = new Date(iso);
    const now = /* @__PURE__ */ new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 6e4);
    if (diff < 1) return "Ahora";
    if (diff < 60) return `Hace ${diff} min`;
    return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  };
  const needsPayment = orders.filter((o) => o.status === "ready_for_payment" || o.status === "served");
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: styles$1.panel, children: /* @__PURE__ */ jsx("div", { className: styles$1.empty, children: "Cargando pedidos..." }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: styles$1.panel, children: [
    serviceRequests.length > 0 && /* @__PURE__ */ jsxs("div", { className: styles$1.requestsSection, children: [
      /* @__PURE__ */ jsxs("h3", { className: styles$1.requestsTitle, children: [
        "🚨 Solicitudes activas (",
        serviceRequests.length,
        ")"
      ] }),
      /* @__PURE__ */ jsx("div", { className: styles$1.requestsList, children: serviceRequests.map((req) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: `${styles$1.requestCard} ${req.status === "attending" ? styles$1.requestAttending : styles$1.requestPending}`,
          children: [
            /* @__PURE__ */ jsxs("div", { className: styles$1.requestHeader, children: [
              /* @__PURE__ */ jsxs("div", { className: styles$1.requestType, children: [
                req.type === "solicitud_pago" ? req.method === "datafono" ? /* @__PURE__ */ jsx(IoCardOutline, { size: 18 }) : /* @__PURE__ */ jsx(IoCashOutline, { size: 18 }) : /* @__PURE__ */ jsx(IoCallOutline, { size: 18 }),
                /* @__PURE__ */ jsx("span", { children: req.type === "solicitud_pago" ? `Pago ${req.method === "datafono" ? "(datáfono)" : "(efectivo)"}` : "Camarero" })
              ] }),
              /* @__PURE__ */ jsx("span", { className: styles$1.requestTime, children: formatTime(req.created_at) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: styles$1.requestInfo, children: [
              /* @__PURE__ */ jsxs("span", { className: styles$1.requestTable, children: [
                "Mesa ",
                req.table_number
              ] }),
              req.user_name && /* @__PURE__ */ jsxs("span", { className: styles$1.requestUser, children: [
                /* @__PURE__ */ jsx(IoPersonOutline, { size: 12 }),
                " ",
                req.user_name
              ] }),
              req.total && /* @__PURE__ */ jsxs("span", { className: styles$1.requestTotal, children: [
                req.total.toFixed(2),
                " €"
              ] }),
              req.message && /* @__PURE__ */ jsxs("span", { className: styles$1.requestMessage, children: [
                '"',
                req.message,
                '"'
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: styles$1.requestStatus, children: [
              req.status === "pending" && /* @__PURE__ */ jsxs("span", { className: styles$1.statusBadgePending, children: [
                /* @__PURE__ */ jsx(IoHourglassOutline, { size: 12 }),
                " Pendiente"
              ] }),
              req.status === "attending" && /* @__PURE__ */ jsxs("span", { className: styles$1.statusBadgeAttending, children: [
                /* @__PURE__ */ jsx(IoPersonOutline, { size: 12 }),
                " Atendiendo"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: styles$1.requestActions, children: [
              req.status === "pending" && /* @__PURE__ */ jsx(
                "button",
                {
                  className: `btn btn-secondary btn-sm`,
                  onClick: () => handleRequestAction(req.id, "attending"),
                  children: "👨‍🍳 Atender"
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  className: `btn btn-primary btn-sm`,
                  onClick: () => handleRequestAction(req.id, "completed"),
                  children: [
                    /* @__PURE__ */ jsx(IoCheckmarkOutline, { size: 14 }),
                    req.type === "solicitud_pago" ? " Cobrado" : " Completado"
                  ]
                }
              )
            ] })
          ]
        },
        req.id
      )) })
    ] }),
    needsPayment.length > 0 && /* @__PURE__ */ jsxs("div", { className: styles$1.paymentAlert, children: [
      /* @__PURE__ */ jsx(IoWalletOutline, { size: 18 }),
      /* @__PURE__ */ jsxs("span", { children: [
        /* @__PURE__ */ jsx("strong", { children: needsPayment.length }),
        " mesa",
        needsPayment.length > 1 ? "s" : "",
        " pendiente",
        needsPayment.length > 1 ? "s" : "",
        " de cobro:",
        " ",
        needsPayment.map((o) => `Mesa ${o.table_number}`).join(", ")
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$1.filters, children: [
      /* @__PURE__ */ jsx("button", { className: styles$1.refreshBtn, onClick: () => {
        loadOrders();
        loadRequests();
      }, title: "Refrescar", children: /* @__PURE__ */ jsx(IoRefreshOutline, { size: 16 }) }),
      [
        { key: "all", label: "Activos", count: orders.filter((o) => o.status !== "paid").length },
        { key: "pending", label: "Pendientes", count: orders.filter((o) => o.status === "pending").length },
        { key: "preparing", label: "Preparando", count: orders.filter((o) => o.status === "preparing").length },
        { key: "served", label: "Servidos", count: orders.filter((o) => o.status === "served").length },
        { key: "ready_for_payment", label: "Por cobrar", count: orders.filter((o) => o.status === "ready_for_payment").length }
      ].map((f) => /* @__PURE__ */ jsxs(
        "button",
        {
          className: `${styles$1.filterBtn} ${filter === f.key ? styles$1.filterActive : ""}`,
          onClick: () => setFilter(f.key),
          children: [
            f.label,
            /* @__PURE__ */ jsx("span", { className: styles$1.filterCount, children: f.count })
          ]
        },
        f.key
      ))
    ] }),
    /* @__PURE__ */ jsx("div", { className: styles$1.orders, children: filteredOrders.length === 0 ? /* @__PURE__ */ jsx("div", { className: styles$1.empty, children: "No hay pedidos con este filtro" }) : filteredOrders.map((order) => {
      const config = STATUS_CONFIG[order.status];
      return /* @__PURE__ */ jsxs("div", { className: `${styles$1.order} ${order.status === "ready_for_payment" ? styles$1.orderServed : ""}`, children: [
        /* @__PURE__ */ jsxs("div", { className: styles$1.orderHeader, children: [
          /* @__PURE__ */ jsxs("div", { className: styles$1.orderInfo, children: [
            /* @__PURE__ */ jsx("span", { className: styles$1.orderId, children: order.id.slice(0, 8) }),
            /* @__PURE__ */ jsxs("span", { className: styles$1.orderTable, children: [
              "Mesa ",
              order.table_number
            ] }),
            order.user_name && /* @__PURE__ */ jsxs("span", { className: styles$1.orderUser, children: [
              /* @__PURE__ */ jsx(IoPersonOutline, { size: 12 }),
              " ",
              order.user_name
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles$1.orderMeta, children: [
            /* @__PURE__ */ jsxs(
              "span",
              {
                className: styles$1.status,
                style: { background: `${config.color}15`, color: config.color },
                children: [
                  config.icon,
                  " ",
                  config.label
                ]
              }
            ),
            /* @__PURE__ */ jsx("span", { className: styles$1.time, children: formatTime(order.created_at) })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: styles$1.orderItems, children: order.items.map((item, i) => /* @__PURE__ */ jsxs("div", { className: styles$1.orderItem, children: [
          /* @__PURE__ */ jsxs("span", { className: styles$1.itemQty, children: [
            item.quantity,
            "x"
          ] }),
          /* @__PURE__ */ jsx("span", { className: styles$1.itemName, children: item.product_name }),
          item.notes && /* @__PURE__ */ jsxs("span", { className: styles$1.itemNotes, children: [
            "(",
            item.notes,
            ")"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: styles$1.itemPrice, children: [
            (item.unit_price * item.quantity).toFixed(2),
            " €"
          ] })
        ] }, i)) }),
        /* @__PURE__ */ jsxs("div", { className: styles$1.orderFooter, children: [
          /* @__PURE__ */ jsxs("span", { className: styles$1.orderTotal, children: [
            "Total: ",
            order.total.toFixed(2),
            " €"
          ] }),
          NEXT_STATUS[order.status] && /* @__PURE__ */ jsx(
            "button",
            {
              className: `btn ${order.status === "ready_for_payment" ? "btn-primary" : "btn-secondary"} btn-sm`,
              onClick: () => advanceStatus(order.id),
              children: order.status === "ready_for_payment" ? "💰 Cobrar" : `Marcar como ${NEXT_LABEL[order.status]}`
            }
          )
        ] })
      ] }, order.id);
    }) })
  ] });
}

function MenuManager() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCat, setActiveCat] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formCost, setFormCost] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formAvailable, setFormAvailable] = useState(true);
  const [formAllergens, setFormAllergens] = useState([]);
  useEffect(() => {
    async function load() {
      try {
        const [cats, prods] = await Promise.all([getCategories(), getProducts()]);
        setCategories(cats);
        setProducts(prods);
        if (cats.length > 0) setActiveCat(cats[0].id);
      } catch (err) {
        console.error("Error loading menu:", err);
        toast.error("Error al cargar el menú");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);
  const filteredProducts = products.filter((p) => p.category_id === activeCat);
  const resetForm = () => {
    setFormName("");
    setFormDesc("");
    setFormPrice("");
    setFormCost("");
    setFormImage("");
    setFormAvailable(true);
    setFormAllergens([]);
    setEditingProduct(null);
    setShowForm(false);
  };
  const openEditForm = (product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormDesc(product.description || "");
    setFormPrice(product.price.toString());
    setFormCost(product.cost?.toString() || "");
    setFormImage(product.image_url || "");
    setFormAvailable(product.available);
    setFormAllergens(product.allergens || []);
    setShowForm(true);
  };
  const openNewForm = () => {
    resetForm();
    setShowForm(true);
  };
  const handleSave = async () => {
    if (!formName || !formPrice) {
      toast.error("Nombre y precio son obligatorios");
      return;
    }
    const price = parseFloat(formPrice);
    if (isNaN(price) || price < 0) {
      toast.error("Precio inválido");
      return;
    }
    const cost = formCost ? parseFloat(formCost) : void 0;
    if (formCost && (isNaN(cost) || cost < 0)) {
      toast.error("Coste inválido");
      return;
    }
    try {
      const productData = {
        category_id: activeCat,
        name: formName,
        description: formDesc || null,
        price,
        cost: cost ?? null,
        image_url: formImage || null,
        available: formAvailable,
        allergens: formAllergens,
        tags: editingProduct?.tags || [],
        order: editingProduct?.order ?? filteredProducts.length + 1
      };
      if (editingProduct) {
        productData.id = editingProduct.id;
      }
      const saved = await upsertProduct(productData);
      if (editingProduct) {
        setProducts((prev) => prev.map((p) => p.id === saved.id ? saved : p));
        toast.success("Producto actualizado");
      } else {
        setProducts((prev) => [...prev, saved]);
        toast.success("Producto añadido");
      }
      resetForm();
    } catch (err) {
      console.error("Error saving product:", err);
      toast.error("Error al guardar el producto");
    }
  };
  const handleDelete = async (productId) => {
    try {
      await deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast.success("Producto eliminado");
    } catch (err) {
      console.error("Error deleting product:", err);
      toast.error("Error al eliminar el producto");
    }
  };
  const handleToggleAvailability = async (productId) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    try {
      await toggleProductAvailability(productId, !product.available);
      setProducts(
        (prev) => prev.map(
          (p) => p.id === productId ? { ...p, available: !p.available } : p
        )
      );
    } catch (err) {
      console.error("Error toggling availability:", err);
      toast.error("Error al cambiar disponibilidad");
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: styles$2.manager, children: /* @__PURE__ */ jsx("p", { style: { textAlign: "center", padding: "2rem" }, children: "Cargando menú..." }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: styles$2.manager, children: [
    /* @__PURE__ */ jsx("div", { className: styles$2.catBar, children: categories.map((cat) => /* @__PURE__ */ jsxs(
      "button",
      {
        className: `${styles$2.catBtn} ${activeCat === cat.id ? styles$2.catActive : ""}`,
        onClick: () => setActiveCat(cat.id),
        children: [
          cat.name,
          /* @__PURE__ */ jsx("span", { className: styles$2.catCount, children: products.filter((p) => p.category_id === cat.id).length })
        ]
      },
      cat.id
    )) }),
    /* @__PURE__ */ jsxs("div", { className: styles$2.toolbar, children: [
      /* @__PURE__ */ jsxs("span", { className: styles$2.productCount, children: [
        filteredProducts.length,
        " producto",
        filteredProducts.length !== 1 ? "s" : ""
      ] }),
      /* @__PURE__ */ jsxs("button", { className: "btn btn-primary btn-sm", onClick: openNewForm, children: [
        /* @__PURE__ */ jsx(IoAddOutline, { size: 16 }),
        " Añadir producto"
      ] })
    ] }),
    showForm && /* @__PURE__ */ jsxs("div", { className: styles$2.form, children: [
      /* @__PURE__ */ jsx("h3", { children: editingProduct ? "Editar producto" : "Nuevo producto" }),
      /* @__PURE__ */ jsxs("div", { className: styles$2.formGrid, children: [
        /* @__PURE__ */ jsxs("div", { className: styles$2.field, children: [
          /* @__PURE__ */ jsx("label", { children: "Nombre" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: formName,
              onChange: (e) => setFormName(e.target.value),
              placeholder: "Nombre del producto"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$2.field, children: [
          /* @__PURE__ */ jsx("label", { children: "Precio (€)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              step: "0.01",
              min: "0",
              value: formPrice,
              onChange: (e) => setFormPrice(e.target.value),
              placeholder: "0.00"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$2.field, children: [
          /* @__PURE__ */ jsx("label", { children: "Coste (€)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              step: "0.01",
              min: "0",
              value: formCost,
              onChange: (e) => setFormCost(e.target.value),
              placeholder: "0.00"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: `${styles$2.field} ${styles$2.fieldFull}`, children: [
          /* @__PURE__ */ jsx("label", { children: "Descripción" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: formDesc,
              onChange: (e) => setFormDesc(e.target.value),
              placeholder: "Descripción opcional"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: `${styles$2.field} ${styles$2.fieldFull}`, children: [
          /* @__PURE__ */ jsx("label", { children: "URL de imagen" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: formImage,
              onChange: (e) => setFormImage(e.target.value),
              placeholder: "https://..."
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: `${styles$2.field} ${styles$2.fieldFull}`, children: [
          /* @__PURE__ */ jsx("label", { children: "Alérgenos" }),
          /* @__PURE__ */ jsx("div", { className: styles$2.allergenGrid, children: Object.keys(ALLERGEN_INFO).map((key) => /* @__PURE__ */ jsxs("label", { className: `${styles$2.allergenChip} ${formAllergens.includes(key) ? styles$2.allergenActive : ""}`, children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: formAllergens.includes(key),
                onChange: (e) => {
                  if (e.target.checked) {
                    setFormAllergens((prev) => [...prev, key]);
                  } else {
                    setFormAllergens((prev) => prev.filter((a) => a !== key));
                  }
                }
              }
            ),
            /* @__PURE__ */ jsx("span", { children: ALLERGEN_INFO[key].icon }),
            /* @__PURE__ */ jsx("span", { children: ALLERGEN_INFO[key].label })
          ] }, key)) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: styles$2.field, children: /* @__PURE__ */ jsxs("label", { className: styles$2.checkLabel, children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: formAvailable,
              onChange: (e) => setFormAvailable(e.target.checked)
            }
          ),
          "Disponible"
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$2.formActions, children: [
        /* @__PURE__ */ jsx("button", { className: "btn btn-outline btn-sm", onClick: resetForm, children: "Cancelar" }),
        /* @__PURE__ */ jsx("button", { className: "btn btn-primary btn-sm", onClick: handleSave, children: editingProduct ? "Guardar cambios" : "Añadir" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: styles$2.products, children: filteredProducts.map((product) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: `${styles$2.product} ${!product.available ? styles$2.unavailable : ""}`,
        children: [
          /* @__PURE__ */ jsxs("div", { className: styles$2.productInfo, children: [
            /* @__PURE__ */ jsx("span", { className: styles$2.productName, children: product.name }),
            product.description && /* @__PURE__ */ jsx("span", { className: styles$2.productDesc, children: product.description })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles$2.productPrices, children: [
            /* @__PURE__ */ jsxs("span", { className: styles$2.productPrice, children: [
              product.price.toFixed(2),
              " €"
            ] }),
            product.cost != null && /* @__PURE__ */ jsxs("span", { className: styles$2.productCost, children: [
              "Coste: ",
              product.cost.toFixed(2),
              " €"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles$2.productActions, children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                className: styles$2.actionBtn,
                onClick: () => handleToggleAvailability(product.id),
                title: product.available ? "Deshabilitar" : "Habilitar",
                children: /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: `${styles$2.dot} ${product.available ? styles$2.dotGreen : styles$2.dotRed}`
                  }
                )
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                className: styles$2.actionBtn,
                onClick: () => openEditForm(product),
                title: "Editar",
                children: /* @__PURE__ */ jsx(IoCreateOutline, { size: 16 })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                className: `${styles$2.actionBtn} ${styles$2.deleteBtn}`,
                onClick: () => handleDelete(product.id),
                title: "Eliminar",
                children: /* @__PURE__ */ jsx(IoTrashOutline, { size: 16 })
              }
            )
          ] })
        ]
      },
      product.id
    )) })
  ] });
}

function TablesPanel() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getTables().then((data) => setTables(data)).catch((err) => {
      console.error("Error loading tables:", err);
      toast.error("Error al cargar las mesas");
    }).finally(() => setLoading(false));
  }, []);
  const toggleTable = async (tableId) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;
    try {
      await upsertTable({ id: table.id, number: table.number, active: !table.active });
      setTables(
        (prev) => prev.map(
          (t) => t.id === tableId ? { ...t, active: !t.active } : t
        )
      );
    } catch (err) {
      console.error("Error toggling table:", err);
      toast.error("Error al cambiar estado de la mesa");
    }
  };
  const addTable = async () => {
    const nextNumber = tables.length > 0 ? Math.max(...tables.map((t) => t.number)) + 1 : 1;
    try {
      const newTable = await upsertTable({ number: nextNumber, active: true });
      setTables((prev) => [...prev, newTable]);
      toast.success(`Mesa ${nextNumber} añadida`);
    } catch (err) {
      console.error("Error adding table:", err);
      toast.error("Error al añadir mesa");
    }
  };
  const removeTable = async (tableId) => {
    try {
      await deleteTable(tableId);
      setTables((prev) => prev.filter((t) => t.id !== tableId));
      toast.success("Mesa eliminada");
    } catch (err) {
      console.error("Error removing table:", err);
      toast.error("Error al eliminar mesa");
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: styles$3.panel, children: /* @__PURE__ */ jsx("p", { style: { textAlign: "center", padding: "2rem" }, children: "Cargando mesas..." }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: styles$3.panel, children: [
    /* @__PURE__ */ jsxs("div", { className: styles$3.toolbar, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$3.stats, children: [
        /* @__PURE__ */ jsxs("span", { className: styles$3.stat, children: [
          /* @__PURE__ */ jsx("span", { className: styles$3.statValue, children: tables.filter((t) => t.active).length }),
          /* @__PURE__ */ jsx("span", { className: styles$3.statLabel, children: "Activas" })
        ] }),
        /* @__PURE__ */ jsxs("span", { className: styles$3.stat, children: [
          /* @__PURE__ */ jsx("span", { className: styles$3.statValue, children: tables.length }),
          /* @__PURE__ */ jsx("span", { className: styles$3.statLabel, children: "Total" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("button", { className: "btn btn-primary btn-sm", onClick: addTable, children: [
        /* @__PURE__ */ jsx(IoAddOutline, { size: 16 }),
        " Añadir mesa"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: styles$3.grid, children: tables.map((table) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: `${styles$3.table} ${!table.active ? styles$3.disabled : styles$3.free}`,
        children: [
          /* @__PURE__ */ jsx("span", { className: styles$3.tableNumber, children: table.number }),
          /* @__PURE__ */ jsx("span", { className: styles$3.tableStatus, children: table.active ? "Activa" : "Deshabilitada" }),
          /* @__PURE__ */ jsxs("div", { className: styles$3.tableActions, children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                className: "btn btn-outline btn-sm",
                onClick: () => toggleTable(table.id),
                children: table.active ? "Deshabilitar" : "Habilitar"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                className: "btn btn-outline btn-sm",
                onClick: () => removeTable(table.id),
                style: { color: "#ef4444" },
                children: "Eliminar"
              }
            )
          ] })
        ]
      },
      table.id
    )) })
  ] });
}

function QRGenerator() {
  const [baseUrl, setBaseUrl] = useState("");
  const [tableCount, setTableCount] = useState(10);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef(null);
  useEffect(() => {
    async function load() {
      try {
        const [settings, tables2] = await Promise.all([getAdminSettings(), getTables()]);
        setBaseUrl(settings.base_url || window.location.origin);
        setTableCount(tables2.length || 10);
      } catch {
        setBaseUrl(window.location.origin);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);
  const tables = Array.from({ length: tableCount }, (_, i) => i + 1);
  const getUrl = (table) => `${baseUrl}/mesa/${table}`;
  const handlePrintAll = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Codes - ORDERLY</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', sans-serif; }
            .page { 
              display: grid; 
              grid-template-columns: repeat(2, 1fr); 
              gap: 2rem; 
              padding: 2rem;
            }
            .qr-card { 
              text-align: center; 
              padding: 1.5rem; 
              border: 2px solid #e5e7eb; 
              border-radius: 12px;
              page-break-inside: avoid;
            }
            .qr-card h3 { 
              font-size: 1.25rem; 
              margin-bottom: 0.75rem; 
              color: #0A0A0A;
            }
            .qr-card p { 
              font-size: 0.875rem; 
              color: #6b7280; 
              margin-top: 0.75rem;
            }
            .brand { 
              font-size: 0.75rem; 
              color: #9ca3af; 
              margin-top: 0.25rem;
            }
            @media print {
              .page { gap: 1.5rem; padding: 1rem; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };
  const handleDownloadSVG = (table) => {
    const svg = document.getElementById(`qr-${table}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orderly-mesa-${table}-qr.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: styles$4.panel, children: /* @__PURE__ */ jsx("p", { style: { textAlign: "center", padding: "2rem" }, children: "Cargando..." }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: styles$4.panel, children: [
    /* @__PURE__ */ jsxs("div", { className: styles$4.config, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$4.field, children: [
        /* @__PURE__ */ jsx("label", { children: "URL base de la aplicación" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: baseUrl,
            onChange: (e) => setBaseUrl(e.target.value),
            placeholder: "https://tu-dominio.com",
            className: styles$4.input
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$4.field, children: [
        /* @__PURE__ */ jsx("label", { children: "Número de mesas" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            min: "1",
            max: "100",
            value: tableCount,
            onChange: (e) => setTableCount(parseInt(e.target.value) || 1),
            className: styles$4.input
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("button", { className: "btn btn-secondary btn-sm", onClick: handlePrintAll, children: [
        /* @__PURE__ */ jsx(IoPrintOutline, { size: 16 }),
        " Imprimir todos"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: styles$4.grid, children: tables.map((table) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: `${styles$4.qrCard} ${selectedTable === table ? styles$4.selected : ""}`,
        onClick: () => setSelectedTable(selectedTable === table ? null : table),
        children: [
          /* @__PURE__ */ jsxs("h3", { className: styles$4.qrTitle, children: [
            "Mesa ",
            table
          ] }),
          /* @__PURE__ */ jsx("div", { className: styles$4.qrWrap, children: /* @__PURE__ */ jsx(
            QRCodeSVG,
            {
              id: `qr-${table}`,
              value: getUrl(table),
              size: 160,
              level: "M",
              includeMargin: true,
              bgColor: "transparent",
              fgColor: "#0A0A0A"
            }
          ) }),
          /* @__PURE__ */ jsx("p", { className: styles$4.qrUrl, children: getUrl(table) }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              className: "btn btn-outline btn-sm",
              style: { marginTop: "0.5rem" },
              onClick: (e) => {
                e.stopPropagation();
                handleDownloadSVG(table);
              },
              children: [
                /* @__PURE__ */ jsx(IoDownloadOutline, { size: 14 }),
                " Descargar"
              ]
            }
          )
        ]
      },
      table
    )) }),
    /* @__PURE__ */ jsx("div", { ref: printRef, style: { display: "none" }, children: /* @__PURE__ */ jsx("div", { className: "page", children: tables.map((table) => /* @__PURE__ */ jsxs("div", { className: "qr-card", children: [
      /* @__PURE__ */ jsxs("h3", { children: [
        "Mesa ",
        table
      ] }),
      /* @__PURE__ */ jsx(
        QRCodeSVG,
        {
          value: getUrl(table),
          size: 200,
          level: "M",
          includeMargin: true,
          bgColor: "transparent",
          fgColor: "#0A0A0A"
        }
      ),
      /* @__PURE__ */ jsx("p", { children: "Escanea para ver el menú" }),
      /* @__PURE__ */ jsx("p", { className: "brand", children: "ORDERLY" })
    ] }, table)) }) })
  ] });
}

function EarningsPanel() {
  const [period, setPeriod] = useState("today");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getPaidOrders().then((data) => setOrders(data)).catch(console.error).finally(() => setLoading(false));
  }, []);
  const filtered = useMemo(() => {
    const now = /* @__PURE__ */ new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return orders.filter((o) => {
      const d = new Date(o.paid_at);
      switch (period) {
        case "today":
          return d >= startOfDay;
        case "week":
          return d >= startOfWeek;
        case "month":
          return d >= startOfMonth;
        default:
          return true;
      }
    });
  }, [orders, period]);
  const stats = useMemo(() => {
    const totalRevenue = filtered.reduce((s, o) => s + o.total, 0);
    const totalCost = filtered.reduce((s, o) => s + (o.total_cost || 0), 0);
    const totalProfit = totalRevenue - totalCost;
    const margin = totalRevenue > 0 ? totalProfit / totalRevenue * 100 : 0;
    const orderCount = filtered.length;
    const avgTicket = orderCount > 0 ? totalRevenue / orderCount : 0;
    const productMap = /* @__PURE__ */ new Map();
    filtered.forEach((o) => {
      o.items.forEach((item) => {
        const existing = productMap.get(item.product_name) || { qty: 0, revenue: 0, profit: 0 };
        existing.qty += item.quantity;
        existing.revenue += item.unit_price * item.quantity;
        existing.profit += (item.unit_price - (item.unit_cost || 0)) * item.quantity;
        productMap.set(item.product_name, existing);
      });
    });
    const bestSellers = Array.from(productMap.entries()).map(([name, data]) => ({ name, ...data })).sort((a, b) => b.qty - a.qty).slice(0, 8);
    const methods = /* @__PURE__ */ new Map();
    filtered.forEach((o) => {
      const m = o.payment_method || "Desconocido";
      const existing = methods.get(m) || { count: 0, amount: 0 };
      existing.count += 1;
      existing.amount += o.total;
      methods.set(m, existing);
    });
    const paymentBreakdown = Array.from(methods.entries()).map(([method, data]) => ({ method, ...data }));
    return { totalRevenue, totalCost, totalProfit, margin, orderCount, avgTicket, bestSellers, paymentBreakdown };
  }, [filtered]);
  const periodLabels = {
    today: "Hoy",
    week: "Esta semana",
    month: "Este mes",
    all: "Todo"
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: styles$5.panel, children: /* @__PURE__ */ jsx("p", { style: { textAlign: "center", padding: "2rem" }, children: "Cargando datos..." }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: styles$5.panel, children: [
    /* @__PURE__ */ jsx("div", { className: styles$5.periodBar, children: ["today", "week", "month", "all"].map((p) => /* @__PURE__ */ jsx(
      "button",
      {
        className: `${styles$5.periodBtn} ${period === p ? styles$5.periodActive : ""}`,
        onClick: () => setPeriod(p),
        children: periodLabels[p]
      },
      p
    )) }),
    /* @__PURE__ */ jsxs("div", { className: styles$5.kpiGrid, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$5.kpiCard, children: [
        /* @__PURE__ */ jsx("div", { className: styles$5.kpiIcon, style: { background: "#dbeafe", color: "#2563eb" }, children: /* @__PURE__ */ jsx(IoReceiptOutline, { size: 22 }) }),
        /* @__PURE__ */ jsxs("div", { className: styles$5.kpiInfo, children: [
          /* @__PURE__ */ jsxs("span", { className: styles$5.kpiValue, children: [
            stats.totalRevenue.toFixed(2),
            " €"
          ] }),
          /* @__PURE__ */ jsx("span", { className: styles$5.kpiLabel, children: "Ingresos totales" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$5.kpiCard, children: [
        /* @__PURE__ */ jsx("div", { className: styles$5.kpiIcon, style: { background: "#fef3c7", color: "#d97706" }, children: /* @__PURE__ */ jsx(IoTrendingDownOutline, { size: 22 }) }),
        /* @__PURE__ */ jsxs("div", { className: styles$5.kpiInfo, children: [
          /* @__PURE__ */ jsxs("span", { className: styles$5.kpiValue, children: [
            stats.totalCost.toFixed(2),
            " €"
          ] }),
          /* @__PURE__ */ jsx("span", { className: styles$5.kpiLabel, children: "Coste total" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$5.kpiCard, children: [
        /* @__PURE__ */ jsx("div", { className: styles$5.kpiIcon, style: { background: "#d1fae5", color: "#059669" }, children: /* @__PURE__ */ jsx(IoTrendingUpOutline, { size: 22 }) }),
        /* @__PURE__ */ jsxs("div", { className: styles$5.kpiInfo, children: [
          /* @__PURE__ */ jsxs("span", { className: styles$5.kpiValue, children: [
            stats.totalProfit.toFixed(2),
            " €"
          ] }),
          /* @__PURE__ */ jsx("span", { className: styles$5.kpiLabel, children: "Beneficio neto" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$5.kpiCard, children: [
        /* @__PURE__ */ jsx("div", { className: styles$5.kpiIcon, style: { background: "#ede9fe", color: "#7c3aed" }, children: /* @__PURE__ */ jsx(IoWalletOutline, { size: 22 }) }),
        /* @__PURE__ */ jsxs("div", { className: styles$5.kpiInfo, children: [
          /* @__PURE__ */ jsxs("span", { className: styles$5.kpiValue, children: [
            stats.margin.toFixed(1),
            "%"
          ] }),
          /* @__PURE__ */ jsx("span", { className: styles$5.kpiLabel, children: "Margen" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$5.subStats, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$5.subStat, children: [
        /* @__PURE__ */ jsx("span", { className: styles$5.subValue, children: stats.orderCount }),
        /* @__PURE__ */ jsx("span", { className: styles$5.subLabel, children: "Pedidos" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: styles$5.subDivider }),
      /* @__PURE__ */ jsxs("div", { className: styles$5.subStat, children: [
        /* @__PURE__ */ jsxs("span", { className: styles$5.subValue, children: [
          stats.avgTicket.toFixed(2),
          " €"
        ] }),
        /* @__PURE__ */ jsx("span", { className: styles$5.subLabel, children: "Ticket medio" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$5.columns, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$5.section, children: [
        /* @__PURE__ */ jsxs("h3", { className: styles$5.sectionTitle, children: [
          /* @__PURE__ */ jsx(IoCafeOutline, { size: 16 }),
          " Productos más vendidos"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$5.rankList, children: [
          stats.bestSellers.map((product, i) => /* @__PURE__ */ jsxs("div", { className: styles$5.rankItem, children: [
            /* @__PURE__ */ jsxs("span", { className: styles$5.rankPos, children: [
              "#",
              i + 1
            ] }),
            /* @__PURE__ */ jsxs("div", { className: styles$5.rankInfo, children: [
              /* @__PURE__ */ jsx("span", { className: styles$5.rankName, children: product.name }),
              /* @__PURE__ */ jsxs("span", { className: styles$5.rankDetail, children: [
                product.qty,
                " uds · ",
                product.revenue.toFixed(2),
                " € · Beneficio: ",
                product.profit.toFixed(2),
                " €"
              ] })
            ] })
          ] }, product.name)),
          stats.bestSellers.length === 0 && /* @__PURE__ */ jsx("span", { className: styles$5.noData, children: "Sin datos para este periodo" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$5.section, children: [
        /* @__PURE__ */ jsxs("h3", { className: styles$5.sectionTitle, children: [
          /* @__PURE__ */ jsx(IoWalletOutline, { size: 16 }),
          " Métodos de pago"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles$5.paymentList, children: [
          stats.paymentBreakdown.map((pm) => /* @__PURE__ */ jsxs("div", { className: styles$5.paymentItem, children: [
            /* @__PURE__ */ jsxs("div", { className: styles$5.paymentHeader, children: [
              /* @__PURE__ */ jsx("span", { className: styles$5.paymentMethod, children: pm.method }),
              /* @__PURE__ */ jsxs("span", { className: styles$5.paymentAmount, children: [
                pm.amount.toFixed(2),
                " €"
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: styles$5.paymentBar, children: /* @__PURE__ */ jsx(
              "div",
              {
                className: styles$5.paymentFill,
                style: {
                  width: `${pm.amount / stats.totalRevenue * 100}%`
                }
              }
            ) }),
            /* @__PURE__ */ jsxs("span", { className: styles$5.paymentCount, children: [
              pm.count,
              " pedido",
              pm.count !== 1 ? "s" : "",
              " · ",
              (pm.amount / stats.totalRevenue * 100).toFixed(0),
              "%"
            ] })
          ] }, pm.method)),
          stats.paymentBreakdown.length === 0 && /* @__PURE__ */ jsx("span", { className: styles$5.noData, children: "Sin datos para este periodo" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$5.section, children: [
      /* @__PURE__ */ jsxs("h3", { className: styles$5.sectionTitle, children: [
        /* @__PURE__ */ jsx(IoCalendarOutline, { size: 16 }),
        " Últimos pedidos cobrados"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$5.recentList, children: [
        filtered.slice(0, 10).map((order) => /* @__PURE__ */ jsxs("div", { className: styles$5.recentItem, children: [
          /* @__PURE__ */ jsxs("div", { className: styles$5.recentMain, children: [
            /* @__PURE__ */ jsx("span", { className: styles$5.recentId, children: order.id.slice(0, 8) }),
            /* @__PURE__ */ jsxs("span", { className: styles$5.recentTable, children: [
              "Mesa ",
              order.table_number
            ] }),
            /* @__PURE__ */ jsx("span", { className: styles$5.recentMethod, children: order.payment_method })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles$5.recentNumbers, children: [
            /* @__PURE__ */ jsxs("span", { className: styles$5.recentTotal, children: [
              order.total.toFixed(2),
              " €"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: styles$5.recentProfit, children: [
              "+",
              (order.total - (order.total_cost || 0)).toFixed(2),
              " €"
            ] })
          ] })
        ] }, order.id)),
        filtered.length === 0 && /* @__PURE__ */ jsx("span", { className: styles$5.noData, children: "No hay pedidos cobrados en este periodo" })
      ] })
    ] })
  ] });
}

function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const logoInputRef = useRef(null);
  const headerInputRef = useRef(null);
  useEffect(() => {
    getAdminSettings().then(setSettings).catch(console.error).finally(() => setLoading(false));
  }, []);
  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };
  const handleFileUpload = (key) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 512 * 1024) {
      toast.error("El archivo es demasiado grande (máx. 512 KB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      handleChange(key, reader.result);
      toast.success("Imagen cargada. Pulsa Guardar para aplicar.");
    };
    reader.readAsDataURL(file);
  };
  const handleSave = async () => {
    setSaving(true);
    try {
      const keys = [
        "admin_password",
        "business_name",
        "bizum_phone",
        "base_url",
        "stripe_enabled",
        "logo_url",
        "header_url"
      ];
      for (const key of keys) {
        if (settings[key] !== void 0) {
          await updateAdminSetting(key, settings[key]);
        }
      }
      toast.success("Configuración guardada");
    } catch (err) {
      console.error("Error saving settings:", err);
      toast.error("Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: styles$6.panel, children: /* @__PURE__ */ jsx("p", { style: { textAlign: "center", padding: "2rem" }, children: "Cargando configuración..." }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: styles$6.panel, children: [
    /* @__PURE__ */ jsxs("div", { className: styles$6.section, children: [
      /* @__PURE__ */ jsx("h3", { className: styles$6.sectionTitle, children: "Marca / Branding" }),
      /* @__PURE__ */ jsxs("div", { className: styles$6.field, children: [
        /* @__PURE__ */ jsx("label", { children: "Logo" }),
        /* @__PURE__ */ jsxs("div", { className: styles$6.uploadRow, children: [
          settings.logo_url && /* @__PURE__ */ jsx(
            "img",
            {
              src: settings.logo_url,
              alt: "Logo",
              className: styles$6.previewImg
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              className: styles$6.uploadBtn,
              onClick: () => logoInputRef.current?.click(),
              children: [
                /* @__PURE__ */ jsx(IoCloudUploadOutline, { size: 16 }),
                "Subir logo"
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              ref: logoInputRef,
              type: "file",
              accept: "image/*",
              style: { display: "none" },
              onChange: handleFileUpload("logo_url")
            }
          )
        ] }),
        /* @__PURE__ */ jsx("span", { className: styles$6.hint, children: "Logo que aparece en la cabecera del cliente y en el login. Máx 512 KB." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$6.field, children: [
        /* @__PURE__ */ jsx("label", { children: "Encabezado" }),
        /* @__PURE__ */ jsxs("div", { className: styles$6.uploadRow, children: [
          settings.header_url && /* @__PURE__ */ jsx(
            "img",
            {
              src: settings.header_url,
              alt: "Encabezado",
              className: styles$6.previewBanner
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              className: styles$6.uploadBtn,
              onClick: () => headerInputRef.current?.click(),
              children: [
                /* @__PURE__ */ jsx(IoCloudUploadOutline, { size: 16 }),
                "Subir encabezado"
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              ref: headerInputRef,
              type: "file",
              accept: "image/*",
              style: { display: "none" },
              onChange: handleFileUpload("header_url")
            }
          )
        ] }),
        /* @__PURE__ */ jsx("span", { className: styles$6.hint, children: "Banner que aparece en la sección hero del menú. Máx 512 KB." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$6.section, children: [
      /* @__PURE__ */ jsx("h3", { className: styles$6.sectionTitle, children: "General" }),
      /* @__PURE__ */ jsxs("div", { className: styles$6.field, children: [
        /* @__PURE__ */ jsx("label", { children: "Nombre del negocio" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: settings.business_name || "",
            onChange: (e) => handleChange("business_name", e.target.value),
            placeholder: "ORDERLY"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$6.field, children: [
        /* @__PURE__ */ jsx("label", { children: "URL base de la aplicación" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: settings.base_url || "",
            onChange: (e) => handleChange("base_url", e.target.value),
            placeholder: "https://tu-dominio.vercel.app"
          }
        ),
        /* @__PURE__ */ jsx("span", { className: styles$6.hint, children: "Se usa para generar los QR de las mesas" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$6.field, children: [
        /* @__PURE__ */ jsx("label", { children: "Contraseña de administración" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: settings.admin_password || "",
            onChange: (e) => handleChange("admin_password", e.target.value),
            placeholder: "orderly2026"
          }
        ),
        /* @__PURE__ */ jsx("span", { className: styles$6.hint, children: "Contraseña para acceder al panel de admin" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$6.section, children: [
      /* @__PURE__ */ jsx("h3", { className: styles$6.sectionTitle, children: "Pagos — Bizum" }),
      /* @__PURE__ */ jsxs("div", { className: styles$6.field, children: [
        /* @__PURE__ */ jsx("label", { children: "Teléfono Bizum" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "tel",
            value: settings.bizum_phone || "",
            onChange: (e) => handleChange("bizum_phone", e.target.value),
            placeholder: "600 123 456"
          }
        ),
        /* @__PURE__ */ jsx("span", { className: styles$6.hint, children: "Los clientes enviarán el pago por Bizum a este número. Déjalo vacío para ocultar la opción Bizum." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: styles$6.section, children: [
      /* @__PURE__ */ jsx("h3", { className: styles$6.sectionTitle, children: "Pagos — Stripe (Tarjeta)" }),
      /* @__PURE__ */ jsxs("div", { className: styles$6.field, children: [
        /* @__PURE__ */ jsxs("label", { className: styles$6.checkLabel, children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: settings.stripe_enabled === "true",
              onChange: (e) => handleChange("stripe_enabled", e.target.checked ? "true" : "false")
            }
          ),
          "Stripe habilitado"
        ] }),
        /* @__PURE__ */ jsx("span", { className: styles$6.hint, children: "Las claves de Stripe se configuran en las variables de entorno del servidor (STRIPE_SECRET_KEY, PUBLIC_STRIPE_PUBLISHABLE_KEY)." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(
      "button",
      {
        className: "btn btn-primary btn-lg",
        style: { width: "100%", marginTop: "1rem" },
        onClick: handleSave,
        disabled: saving,
        children: [
          /* @__PURE__ */ jsx(IoSaveOutline, { size: 18 }),
          saving ? "Guardando..." : "Guardar configuración"
        ]
      }
    )
  ] });
}

function AdminApp() {
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("orders");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const isAdmin = localStorage.getItem("ema_admin");
    if (isAdmin === "true") {
      setAuthenticated(true);
    }
    setLoading(false);
  }, []);
  const handleLogout = () => {
    localStorage.removeItem("ema_admin");
    setAuthenticated(false);
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: styles$7.loading, children: /* @__PURE__ */ jsx("span", { children: "Cargando..." }) });
  }
  if (!authenticated) {
    return /* @__PURE__ */ jsx(AdminLogin, { onLogin: () => setAuthenticated(true) });
  }
  const tabs = [
    { id: "orders", label: "Pedidos", icon: /* @__PURE__ */ jsx(IoReceiptOutline, { size: 20 }) },
    { id: "earnings", label: "Ganancias", icon: /* @__PURE__ */ jsx(IoStatsChartOutline, { size: 20 }) },
    { id: "menu", label: "Menú", icon: /* @__PURE__ */ jsx(IoRestaurantOutline, { size: 20 }) },
    { id: "tables", label: "Mesas", icon: /* @__PURE__ */ jsx(IoGridOutline, { size: 20 }) },
    { id: "qr", label: "QR", icon: /* @__PURE__ */ jsx(IoQrCodeOutline, { size: 20 }) },
    { id: "settings", label: "Ajustes", icon: /* @__PURE__ */ jsx(IoSettingsOutline, { size: 20 }) }
  ];
  return /* @__PURE__ */ jsxs("div", { className: styles$7.app, children: [
    /* @__PURE__ */ jsx(Toaster, { position: "top-right" }),
    /* @__PURE__ */ jsxs("aside", { className: styles$7.sidebar, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$7.sidebarHeader, children: [
        /* @__PURE__ */ jsx("img", { src: "/logo.png", alt: "ORDERLY", className: styles$7.logoImg }),
        /* @__PURE__ */ jsx("span", { className: styles$7.badge, children: "Admin" })
      ] }),
      /* @__PURE__ */ jsx("nav", { className: styles$7.nav, children: tabs.map((tab) => /* @__PURE__ */ jsxs(
        "button",
        {
          className: `${styles$7.navBtn} ${activeTab === tab.id ? styles$7.navActive : ""}`,
          onClick: () => setActiveTab(tab.id),
          children: [
            tab.icon,
            /* @__PURE__ */ jsx("span", { children: tab.label })
          ]
        },
        tab.id
      )) }),
      /* @__PURE__ */ jsx("div", { className: styles$7.sidebarFooter, children: /* @__PURE__ */ jsxs("button", { className: styles$7.logoutBtn, onClick: handleLogout, children: [
        /* @__PURE__ */ jsx(IoLogOutOutline, { size: 18 }),
        /* @__PURE__ */ jsx("span", { children: "Cerrar sesión" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("main", { className: styles$7.main, children: [
      /* @__PURE__ */ jsx("header", { className: styles$7.topbar, children: /* @__PURE__ */ jsx("h1", { className: styles$7.pageTitle, children: tabs.find((t) => t.id === activeTab)?.label }) }),
      /* @__PURE__ */ jsxs("div", { className: styles$7.content, children: [
        activeTab === "orders" && /* @__PURE__ */ jsx(OrdersPanel, {}),
        activeTab === "earnings" && /* @__PURE__ */ jsx(EarningsPanel, {}),
        activeTab === "menu" && /* @__PURE__ */ jsx(MenuManager, {}),
        activeTab === "tables" && /* @__PURE__ */ jsx(TablesPanel, {}),
        activeTab === "qr" && /* @__PURE__ */ jsx(QRGenerator, {}),
        activeTab === "settings" && /* @__PURE__ */ jsx(AdminSettings, {})
      ] })
    ] }),
    /* @__PURE__ */ jsx("nav", { className: styles$7.mobileNav, children: tabs.map((tab) => /* @__PURE__ */ jsxs(
      "button",
      {
        className: `${styles$7.mobileNavBtn} ${activeTab === tab.id ? styles$7.mobileNavActive : ""}`,
        onClick: () => setActiveTab(tab.id),
        children: [
          tab.icon,
          /* @__PURE__ */ jsx("span", { children: tab.label })
        ]
      },
      tab.id
    )) })
  ] });
}

const $$Admin = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Admin - ORDERLY" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "AdminApp", AdminApp, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Usuario/Desktop/Tfg_EMA/src/components/admin/AdminApp", "client:component-export": "default" })} ` })}`;
}, "C:/Users/Usuario/Desktop/Tfg_EMA/src/pages/admin.astro", void 0);

const $$file = "C:/Users/Usuario/Desktop/Tfg_EMA/src/pages/admin.astro";
const $$url = "/admin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Admin,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
