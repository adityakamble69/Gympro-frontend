import{i as e}from"./rolldown-runtime-aKtaBQYM.js";import{O as t}from"./charts-VUY9Sgpv.js";import{D as n,G as r,L as i,Ot as a,R as o,bt as s,c,d as l,dt as u,gt as d,h as f,i as p,kt as m,l as h,lt as g,rt as _,x as v,yt as y}from"./react-98PJEpnD.js";import{n as b}from"./index-yMo6VHJ0.js";var x=e(t(),1),S=p(),C={at:0,count:0},w=[{icon:i,label:`Dashboard`,path:`/dashboard`},{icon:s,label:`Members`,path:`/members`},{icon:y,label:`Trainers`,path:`/trainers`},{icon:v,label:`Attendance`,path:`/attendance`},{icon:r,label:`Payments`,path:`/payments`},{icon:o,label:`Membership Plans`,path:`/membership-plans`},{icon:u,label:`Equipment`,path:`/equipment`},{icon:n,label:`Inquiries`,path:`/inquiries`,badge:!0},{icon:h,label:`Notifications`,path:`/notifications`},{icon:f,label:`Reports`,path:`/reports`},{icon:d,label:`Profile`,path:`/profile`}];function T({onLogout:e}){let t=m(),n=a(),r=JSON.parse(localStorage.getItem(`gym_admin`)||`{}`),i=r.role===`receptionist`,o=r.name?.split(` `).map(e=>e[0]).join(``).slice(0,2).toUpperCase()||(i?`R`:`A`),[s,u]=(0,x.useState)(C.count),[d,f]=(0,x.useState)(!1),p=w.filter(e=>!(i&&(e.path===`/reports`||e.path===`/equipment`||e.path===`/trainers`))).map(e=>i&&e.path===`/dashboard`?{...e,label:`Front Desk`}:e);(0,x.useEffect)(()=>{h();let e=setInterval(h,6e4);return()=>clearInterval(e)},[]),(0,x.useEffect)(()=>{f(!1)},[n.pathname]),(0,x.useEffect)(()=>(d?document.body.style.overflow=`hidden`:document.body.style.overflow=``,()=>{document.body.style.overflow=``}),[d]);let h=async()=>{try{if(Date.now()-C.at<15e3){u(C.count);return}let e=(await b.get(`/inquiries/stats/summary`)).data.data?.new_count||0;C={at:Date.now(),count:e},u(e)}catch{}},v=e=>{t(e),f(!1)},y=()=>(0,S.jsxs)(`aside`,{className:`sidebar-aside`,style:{width:`220px`,background:`var(--bg-surface)`,borderRight:`1px solid var(--border-subtle)`,display:`flex`,flexDirection:`column`,fontFamily:`var(--font-body)`},children:[(0,S.jsxs)(`div`,{style:{padding:`20px 18px`,borderBottom:`1px solid var(--border-subtle)`,display:`flex`,alignItems:`center`,justifyContent:`space-between`,flexShrink:0},children:[(0,S.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`10px`},children:[(0,S.jsx)(`div`,{style:{width:`30px`,height:`30px`,background:`var(--text-primary)`,borderRadius:`7px`,display:`flex`,alignItems:`center`,justifyContent:`center`,flexShrink:0},children:(0,S.jsx)(l,{style:{color:`#0a0a0a`,fontSize:`15px`}})}),(0,S.jsx)(`span`,{style:{fontFamily:`var(--font-display)`,fontWeight:800,fontSize:`17px`,color:`var(--text-primary)`,letterSpacing:`0.02em`,lineHeight:1.2},children:`Workout World Gym`})]}),(0,S.jsx)(`button`,{onClick:()=>f(!1),style:{display:`none`,background:`none`,border:`none`,cursor:`pointer`,color:`var(--text-muted)`,fontSize:`18px`,padding:`4px`,borderRadius:`6px`,alignItems:`center`,justifyContent:`center`},className:`sidebar-close-btn`,children:(0,S.jsx)(g,{})})]}),(0,S.jsxs)(`nav`,{style:{flex:1,padding:`12px 10px`,overflowY:`auto`,minHeight:0},children:[(0,S.jsx)(`p`,{style:{fontSize:`11px`,fontWeight:600,color:`var(--text-muted)`,textTransform:`uppercase`,letterSpacing:`0.12em`,padding:`8px 10px 6px`,marginBottom:`4px`},children:`Navigation`}),p.map(({icon:e,label:t,path:r,badge:i})=>{let a=n.pathname===r;return(0,S.jsxs)(`div`,{onClick:()=>v(r),style:{display:`flex`,alignItems:`center`,gap:`10px`,padding:`9px 10px`,borderRadius:`var(--radius-sm)`,marginBottom:`2px`,cursor:`pointer`,background:a?`var(--bg-active)`:`transparent`,color:a?`var(--text-primary)`:`var(--text-muted)`,fontWeight:a?600:400,fontSize:`15px`,borderLeft:a?`2px solid var(--accent)`:`2px solid transparent`,transition:`all 0.15s`},onMouseEnter:e=>{a||(e.currentTarget.style.background=`var(--bg-hover)`,e.currentTarget.style.color=`var(--text-secondary)`)},onMouseLeave:e=>{a||(e.currentTarget.style.background=`transparent`,e.currentTarget.style.color=`var(--text-muted)`)},children:[(0,S.jsx)(e,{style:{fontSize:`16px`,flexShrink:0,opacity:a?1:.6}}),(0,S.jsx)(`span`,{style:{flex:1},children:t}),i&&s>0&&(0,S.jsx)(`span`,{style:{background:`#2f81f7`,color:`#fff`,fontSize:`11px`,fontWeight:700,padding:`1px 6px`,borderRadius:`99px`,minWidth:`18px`,textAlign:`center`},children:s})]},r)})]}),(0,S.jsxs)(`div`,{style:{borderTop:`1px solid var(--border-subtle)`,padding:`12px 10px`,paddingBottom:`max(16px, env(safe-area-inset-bottom, 16px))`,flexShrink:0,background:`var(--bg-surface)`},children:[(0,S.jsxs)(`div`,{onClick:()=>v(`/profile`),style:{display:`flex`,alignItems:`center`,gap:`10px`,padding:`9px 10px`,borderRadius:`var(--radius-sm)`,background:`var(--bg-elevated)`,marginBottom:`8px`,cursor:`pointer`,border:`1px solid transparent`,transition:`border-color 0.15s`},onMouseEnter:e=>e.currentTarget.style.borderColor=`var(--border-strong)`,onMouseLeave:e=>e.currentTarget.style.borderColor=`transparent`,children:[(0,S.jsx)(`div`,{style:{width:`30px`,height:`30px`,borderRadius:`50%`,background:`var(--bg-active)`,border:`1px solid var(--border-strong)`,display:`flex`,alignItems:`center`,justifyContent:`center`,fontSize:`12px`,fontWeight:700,color:`var(--text-primary)`,flexShrink:0},children:o}),(0,S.jsxs)(`div`,{style:{overflow:`hidden`,flex:1},children:[(0,S.jsx)(`div`,{style:{fontSize:`14px`,fontWeight:600,color:`var(--text-primary)`,whiteSpace:`nowrap`,overflow:`hidden`,textOverflow:`ellipsis`},children:r.name||`Admin`}),(0,S.jsx)(`div`,{style:{fontSize:`11.5px`,color:`var(--text-muted)`},children:r.role?.replace(`_`,` `)||`admin`})]})]}),(0,S.jsxs)(`button`,{onClick:e,style:{width:`100%`,display:`flex`,alignItems:`center`,justifyContent:`center`,gap:`8px`,padding:`9px 12px`,borderRadius:`var(--radius-sm)`,cursor:`pointer`,background:`rgba(248,113,113,0.1)`,border:`1px solid rgba(248,113,113,0.3)`,color:`var(--red)`,fontSize:`14px`,fontWeight:700,transition:`all 0.15s`},onMouseEnter:e=>e.currentTarget.style.background=`rgba(248,113,113,0.2)`,onMouseLeave:e=>e.currentTarget.style.background=`rgba(248,113,113,0.1)`,children:[(0,S.jsx)(_,{style:{fontSize:`14px`}}),` Sign Out`]})]})]});return(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(`style`,{children:`
        /* ── Desktop: spacer so main content shifts right ── */
        .sidebar-wrapper {
          display: flex;
          flex-shrink: 0;
          width: 220px;
          min-height: 100vh;
        }
        .sidebar-wrapper .sidebar-aside {
          position: fixed;
          top: 0;
          left: 0;
          width: 220px;
          height: 100vh;
          z-index: 100;
        }
        .mobile-topbar {
          display: none;
        }
        .mobile-overlay {
          display: none;
        }
        .sidebar-close-btn {
          display: none !important;
        }

        /* ── Mobile (≤768px) ── */
        @media (max-width: 768px) {
          .sidebar-wrapper {
            display: none;
          }

          .mobile-topbar {
            display: flex;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 52px;
            background: var(--bg-surface);
            border-bottom: 1px solid var(--border-subtle);
            padding: 0 14px;
            align-items: center;
            justify-content: space-between;
            z-index: 1100;
            box-shadow: 0 2px 10px rgba(0,0,0,0.4);
          }

          .mobile-menu-trigger {
            display: flex;
            align-items: center;
            gap: 10px;
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 4px;
          }

          .mobile-menu-trigger:hover {
            color: var(--text-primary);
          }

          .mobile-signout-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            border-radius: var(--radius-sm);
            background: rgba(248,113,113,0.12);
            border: 1px solid rgba(248,113,113,0.3);
            color: var(--red);
            font-size: 12.5px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.15s;
          }

          .mobile-signout-btn:hover {
            background: rgba(248,113,113,0.22);
          }

          /* Overlay backdrop */
          .mobile-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.75);
            z-index: 1201;
            backdrop-filter: blur(2px);
            animation: fadeIn 0.2s ease;
          }

          /* Slide-in drawer */
          .mobile-drawer {
            position: fixed;
            top: 0;
            left: 0;
            height: 100dvh;
            max-height: 100dvh;
            width: 260px;
            z-index: 1202;
            box-shadow: 4px 0 40px rgba(0,0,0,0.85);
            animation: slideInDrawer 0.25s cubic-bezier(0.16,1,0.3,1);
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }

          .mobile-drawer .sidebar-aside {
            position: relative;
            width: 260px;
            height: 100dvh;
            max-height: 100dvh;
          }

          .sidebar-close-btn {
            display: flex !important;
          }
        }

        @keyframes slideInDrawer {
          from { transform: translateX(-100%); opacity: 0.5; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}),(0,S.jsx)(`div`,{className:`sidebar-wrapper`,children:(0,S.jsx)(y,{})}),(0,S.jsxs)(`header`,{className:`mobile-topbar`,children:[(0,S.jsxs)(`button`,{className:`mobile-menu-trigger`,onClick:()=>f(!0),"aria-label":`Open menu`,children:[(0,S.jsx)(c,{style:{fontSize:`18px`}}),(0,S.jsx)(`span`,{style:{fontFamily:`var(--font-display)`,fontWeight:800,fontSize:`16px`,color:`var(--text-primary)`},children:`Workout World Gym`})]}),(0,S.jsxs)(`button`,{onClick:e,className:`mobile-signout-btn`,title:`Sign Out`,children:[(0,S.jsx)(_,{style:{fontSize:`12px`}}),(0,S.jsx)(`span`,{children:`Sign Out`})]})]}),d&&(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(`div`,{className:`mobile-overlay`,onClick:()=>f(!1)}),(0,S.jsx)(`div`,{className:`mobile-drawer`,children:(0,S.jsx)(y,{})})]})]})}export{T as t};