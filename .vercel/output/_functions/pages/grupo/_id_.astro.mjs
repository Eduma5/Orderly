import { e as createComponent, k as renderComponent, r as renderTemplate, h as createAstro } from '../../chunks/astro/server_0IadgrTN.mjs';
import 'piccolore';
import { $ as $$Layout } from '../../chunks/Layout_zzDEcozS.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { IoPersonOutline, IoCheckmarkCircle } from 'react-icons/io5';
import { n as getGroupSession, s as subscribeToOrders, o as getCurrentUser, q as joinGroupSession, r as unclaimGroupItem, v as claimGroupItem, w as payGroupShare } from '../../chunks/db_DD6f8SZr.mjs';
import { u as useUserStore, A as AuthModal } from '../../chunks/AuthModal_5dQYj4yd.mjs';
import { s as styles } from '../../chunks/_id_.541affec_B0Q_X8Nq.mjs';
export { renderers } from '../../renderers.mjs';

function GroupJoinApp({ sessionId }) {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const userLoading = useUserStore((s) => s.loading);
  const setUserLoading = useUserStore((s) => s.setLoading);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);
  const [paying, setPaying] = useState(false);
  const [step, setStep] = useState("join");
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
  const loadSession = useCallback(async () => {
    try {
      const s = await getGroupSession(sessionId);
      if (!s) {
        setError("Sesion de grupo no encontrada");
        return;
      }
      setSession(s);
      setError(null);
    } catch (err) {
      setError(err.message || "Error al cargar la sesion");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);
  useEffect(() => {
    if (user) loadSession();
  }, [user, loadSession]);
  useEffect(() => {
    if (!session) return;
    const sub = subscribeToOrders(() => loadSession());
    return () => sub.unsubscribe();
  }, [session, loadSession]);
  const handleJoin = async () => {
    setJoining(true);
    try {
      const updated = await joinGroupSession(sessionId);
      setSession(updated);
      setStep("select");
      toast.success("Te has unido al grupo.");
    } catch (err) {
      toast.error(err.message || "Error al unirse");
    } finally {
      setJoining(false);
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
      toast.error(err.message || "Error al seleccionar");
    }
  };
  const handlePayShare = async () => {
    if (!session) return;
    setPaying(true);
    try {
      const updated = await payGroupShare(session.id);
      setSession(updated);
      toast.success("Tu parte ha sido pagada al anfitrion.");
    } catch (err) {
      toast.error(err.message || "Error al pagar");
    } finally {
      setPaying(false);
    }
  };
  if (userLoading) {
    return /* @__PURE__ */ jsx("div", { className: styles.app, children: /* @__PURE__ */ jsxs("div", { className: styles.loadingScreen, children: [
      /* @__PURE__ */ jsx("div", { className: styles.spinner }),
      /* @__PURE__ */ jsx("p", { children: "Cargando..." })
    ] }) });
  }
  if (!user) {
    return /* @__PURE__ */ jsxs("div", { className: styles.app, children: [
      /* @__PURE__ */ jsx(Toaster, { position: "top-center" }),
      /* @__PURE__ */ jsx(
        AuthModal,
        {
          tableNumber: 0,
          onAuthenticated: (u) => {
            setUser(u);
            toast.success(`Hola ${u.name}!`);
          }
        }
      )
    ] });
  }
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: styles.app, children: /* @__PURE__ */ jsxs("div", { className: styles.loadingScreen, children: [
      /* @__PURE__ */ jsx("div", { className: styles.spinner }),
      /* @__PURE__ */ jsx("p", { children: "Cargando grupo..." })
    ] }) });
  }
  if (error || !session) {
    return /* @__PURE__ */ jsx("div", { className: styles.app, children: /* @__PURE__ */ jsxs("div", { className: styles.errorScreen, children: [
      /* @__PURE__ */ jsx("h2", { children: "Error" }),
      /* @__PURE__ */ jsx("p", { children: error || "Sesion no encontrada" })
    ] }) });
  }
  const isMember = session.members.some((m) => m.user_id === user.id);
  const myMember = session.members.find((m) => m.user_id === user.id);
  session.host_user_id === user.id;
  const myItems = session.items.filter((i) => i.claimed_by === user.id);
  const myTotal = myItems.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const totalGroup = session.items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  return /* @__PURE__ */ jsxs("div", { className: styles.app, children: [
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
    /* @__PURE__ */ jsxs("div", { className: styles.container, children: [
      /* @__PURE__ */ jsxs("div", { className: styles.header, children: [
        /* @__PURE__ */ jsx("h1", { className: styles.title, children: "Pago en grupo" }),
        /* @__PURE__ */ jsxs("p", { className: styles.subtitle, children: [
          "Mesa ",
          session.table_number,
          " - Anfitrion: ",
          session.host_name
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles.totalCard, children: [
        /* @__PURE__ */ jsx("div", { className: styles.totalLabel, children: "Total del pedido" }),
        /* @__PURE__ */ jsxs("div", { className: styles.totalAmount, children: [
          totalGroup.toFixed(2),
          " EUR"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: styles.membersCount, children: [
          /* @__PURE__ */ jsx(IoPersonOutline, { size: 14 }),
          session.members.length,
          " miembro",
          session.members.length > 1 ? "s" : ""
        ] })
      ] }),
      !isMember && step === "join" && /* @__PURE__ */ jsxs("div", { className: styles.joinSection, children: [
        /* @__PURE__ */ jsx("p", { children: "Unete al grupo para seleccionar los platos que has consumido y pagar tu parte." }),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: styles.joinBtn,
            onClick: handleJoin,
            disabled: joining,
            children: joining ? "Uniendose..." : "Unirme al grupo"
          }
        )
      ] }),
      (isMember || step === "select") && step !== "pay" && /* @__PURE__ */ jsxs("div", { className: styles.selectSection, children: [
        /* @__PURE__ */ jsx("h3", { className: styles.sectionTitle, children: "Selecciona tus platos" }),
        /* @__PURE__ */ jsx("div", { className: styles.itemsList, children: session.items.map((item) => {
          const isMine = item.claimed_by === user.id;
          const isTaken = item.claimed_by !== null && !isMine;
          const claimedByName = isTaken ? session.members.find((m) => m.user_id === item.claimed_by)?.name || "Otro" : null;
          return /* @__PURE__ */ jsxs(
            "button",
            {
              className: `${styles.itemCard} ${isMine ? styles.itemMine : ""} ${isTaken ? styles.itemTaken : ""}`,
              onClick: () => handleToggleClaim(item),
              disabled: isTaken,
              children: [
                /* @__PURE__ */ jsxs("div", { className: styles.itemInfo, children: [
                  /* @__PURE__ */ jsx("span", { className: styles.itemName, children: item.product_name }),
                  /* @__PURE__ */ jsxs("span", { className: styles.itemPrice, children: [
                    item.unit_price.toFixed(2),
                    " EUR"
                  ] })
                ] }),
                isMine && /* @__PURE__ */ jsx(IoCheckmarkCircle, { size: 20, className: styles.itemCheck }),
                isTaken && claimedByName && /* @__PURE__ */ jsx("span", { className: styles.itemClaimedBy, children: claimedByName })
              ]
            },
            item.id
          );
        }) }),
        /* @__PURE__ */ jsxs("div", { className: styles.myTotal, children: [
          /* @__PURE__ */ jsx("span", { children: "Tu total:" }),
          /* @__PURE__ */ jsxs("strong", { children: [
            myTotal.toFixed(2),
            " EUR"
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: styles.nextBtn,
            onClick: () => setStep("pay"),
            disabled: myItems.length === 0,
            children: "Continuar al pago"
          }
        )
      ] }),
      step === "pay" && /* @__PURE__ */ jsxs("div", { className: styles.paySection, children: [
        /* @__PURE__ */ jsxs("div", { className: styles.myTotalBig, children: [
          /* @__PURE__ */ jsx("div", { className: styles.totalLabel, children: "Tu parte" }),
          /* @__PURE__ */ jsxs("div", { className: styles.totalAmount, children: [
            myTotal.toFixed(2),
            " EUR"
          ] })
        ] }),
        /* @__PURE__ */ jsx("h3", { className: styles.sectionTitle, children: "Tus platos" }),
        /* @__PURE__ */ jsx("div", { className: styles.myItemsList, children: myItems.map((item) => /* @__PURE__ */ jsxs("div", { className: styles.myItemRow, children: [
          /* @__PURE__ */ jsx("span", { children: item.product_name }),
          /* @__PURE__ */ jsxs("span", { children: [
            item.unit_price.toFixed(2),
            " EUR"
          ] })
        ] }, item.id)) }),
        !myMember?.paid ? /* @__PURE__ */ jsx(
          "button",
          {
            className: styles.payBtn,
            onClick: handlePayShare,
            disabled: paying || myTotal <= 0,
            children: paying ? "Procesando..." : `Pagar ${myTotal.toFixed(2)} EUR al monedero del anfitrion`
          }
        ) : /* @__PURE__ */ jsx("div", { className: styles.paidBanner, children: "Tu parte esta pagada" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: styles.backBtn,
            onClick: () => setStep("select"),
            children: "Volver a seleccionar platos"
          }
        )
      ] }),
      session.status === "completed" && /* @__PURE__ */ jsx("div", { className: styles.completedBanner, children: "Todos los pagos completados. Gracias!" })
    ] })
  ] });
}

const $$Astro = createAstro();
const $$id = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  if (!id) {
    return Astro2.redirect("/");
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Unirse al grupo - ORDERLY" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "GroupJoinApp", GroupJoinApp, { "client:load": true, "sessionId": id, "client:component-hydration": "load", "client:component-path": "C:/Users/Usuario/Desktop/Tfg_EMA/src/components/customer/GroupJoinApp", "client:component-export": "default" })} ` })}`;
}, "C:/Users/Usuario/Desktop/Tfg_EMA/src/pages/grupo/[id].astro", void 0);

const $$file = "C:/Users/Usuario/Desktop/Tfg_EMA/src/pages/grupo/[id].astro";
const $$url = "/grupo/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
