import{i as e}from"./rolldown-runtime-aKtaBQYM.js";import{O as t}from"./charts-VUY9Sgpv.js";import{Dt as n,E as r,Et as i,I as a,L as o,U as s,_t as c,b as l,c as u,d,i as f,l as p,lt as m,m as h,mt as g,st as _,tt as v,vt as y}from"./react-CNT2rLLL.js";import{n as b}from"./index-b5JQtfzI.js";var x=e(t(),1),S=f(),C={at:0,count:0},w=[{icon:a,label:`Dashboard`,path:`/dashboard`},{icon:y,label:`Members`,path:`/members`},{icon:c,label:`Trainers`,path:`/trainers`},{icon:l,label:`Attendance`,path:`/attendance`},{icon:s,label:`Payments`,path:`/payments`},{icon:o,label:`Membership Plans`,path:`/membership-plans`},{icon:m,label:`Equipment`,path:`/equipment`},{icon:r,label:`Inquiries`,path:`/inquiries`,badge:!0},{icon:p,label:`Notifications`,path:`/notifications`},{icon:h,label:`Reports`,path:`/reports`},{icon:g,label:`Profile`,path:`/profile`}];function T({onLogout:e}){let t=n(),r=i(),a=JSON.parse(localStorage.getItem(`gym_admin`)||`{}`),o=a.name?.split(` `).map(e=>e[0]).join(``).slice(0,2).toUpperCase()||`A`,[s,c]=(0,x.useState)(C.count),[l,f]=(0,x.useState)(!1);(0,x.useEffect)(()=>{p();let e=setInterval(p,6e4);return()=>clearInterval(e)},[]),(0,x.useEffect)(()=>{f(!1)},[r.pathname]),(0,x.useEffect)(()=>(l?document.body.style.overflow=`hidden`:document.body.style.overflow=``,()=>{document.body.style.overflow=``}),[l]);let p=async()=>{try{if(Date.now()-C.at<15e3){c(C.count);return}let e=(await b.get(`/inquiries/stats/summary`)).data.data?.new_count||0;C={at:Date.now(),count:e},c(e)}catch{}},m=e=>{t(e),f(!1)},h=()=>(0,S.jsxs)(`aside`,{style:{width:`220px`,background:`var(--bg-surface)`,borderRight:`1px solid var(--border-subtle)`,height:`100vh`,display:`flex`,flexDirection:`column`,fontFamily:`var(--font-body)`,position:`fixed`,top:0,left:0,zIndex:100},children:[(0,S.jsxs)(`div`,{style:{padding:`24px 20px 20px`,borderBottom:`1px solid var(--border-subtle)`,display:`flex`,alignItems:`center`,justifyContent:`space-between`},children:[(0,S.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`10px`},children:[(0,S.jsx)(`div`,{style:{width:`30px`,height:`30px`,background:`var(--text-primary)`,borderRadius:`7px`,display:`flex`,alignItems:`center`,justifyContent:`center`,flexShrink:0},children:(0,S.jsx)(d,{style:{color:`#0a0a0a`,fontSize:`15px`}})}),(0,S.jsx)(`span`,{style:{fontFamily:`var(--font-display)`,fontWeight:800,fontSize:`17px`,color:`var(--text-primary)`,letterSpacing:`0.02em`,lineHeight:1.2},children:`Workout World Gym`})]}),(0,S.jsx)(`button`,{onClick:()=>f(!1),style:{display:`none`,background:`none`,border:`none`,cursor:`pointer`,color:`var(--text-muted)`,fontSize:`18px`,padding:`4px`,borderRadius:`6px`,alignItems:`center`,justifyContent:`center`},className:`sidebar-close-btn`,children:(0,S.jsx)(_,{})})]}),(0,S.jsxs)(`nav`,{style:{flex:1,padding:`12px 10px`,overflowY:`auto`,minHeight:0},children:[(0,S.jsx)(`p`,{style:{fontSize:`11px`,fontWeight:600,color:`var(--text-muted)`,textTransform:`uppercase`,letterSpacing:`0.12em`,padding:`8px 10px 6px`,marginBottom:`4px`},children:`Navigation`}),w.map(({icon:e,label:t,path:n,badge:i})=>{let a=r.pathname===n;return(0,S.jsxs)(`div`,{onClick:()=>m(n),style:{display:`flex`,alignItems:`center`,gap:`10px`,padding:`9px 10px`,borderRadius:`var(--radius-sm)`,marginBottom:`2px`,cursor:`pointer`,background:a?`var(--bg-active)`:`transparent`,color:a?`var(--text-primary)`:`var(--text-muted)`,fontWeight:a?600:400,fontSize:`15px`,borderLeft:a?`2px solid var(--accent)`:`2px solid transparent`,transition:`all 0.15s`},onMouseEnter:e=>{a||(e.currentTarget.style.background=`var(--bg-hover)`,e.currentTarget.style.color=`var(--text-secondary)`)},onMouseLeave:e=>{a||(e.currentTarget.style.background=`transparent`,e.currentTarget.style.color=`var(--text-muted)`)},children:[(0,S.jsx)(e,{style:{fontSize:`16px`,flexShrink:0,opacity:a?1:.6}}),(0,S.jsx)(`span`,{style:{flex:1},children:t}),i&&s>0&&(0,S.jsx)(`span`,{style:{background:`#2f81f7`,color:`#fff`,fontSize:`11px`,fontWeight:700,padding:`1px 6px`,borderRadius:`99px`,minWidth:`18px`,textAlign:`center`},children:s})]},n)})]}),(0,S.jsxs)(`div`,{style:{borderTop:`1px solid var(--border-subtle)`,padding:`12px 10px`},children:[(0,S.jsxs)(`div`,{onClick:()=>m(`/profile`),style:{display:`flex`,alignItems:`center`,gap:`10px`,padding:`10px`,borderRadius:`var(--radius-sm)`,background:`var(--bg-elevated)`,marginBottom:`8px`,cursor:`pointer`,border:`1px solid transparent`,transition:`border-color 0.15s`},onMouseEnter:e=>e.currentTarget.style.borderColor=`var(--border-strong)`,onMouseLeave:e=>e.currentTarget.style.borderColor=`transparent`,children:[(0,S.jsx)(`div`,{style:{width:`30px`,height:`30px`,borderRadius:`50%`,background:`var(--bg-active)`,border:`1px solid var(--border-strong)`,display:`flex`,alignItems:`center`,justifyContent:`center`,fontSize:`12px`,fontWeight:700,color:`var(--text-primary)`,flexShrink:0},children:o}),(0,S.jsxs)(`div`,{style:{overflow:`hidden`,flex:1},children:[(0,S.jsx)(`div`,{style:{fontSize:`15px`,fontWeight:600,color:`var(--text-primary)`,whiteSpace:`nowrap`,overflow:`hidden`,textOverflow:`ellipsis`},children:a.name||`Admin`}),(0,S.jsx)(`div`,{style:{fontSize:`12px`,color:`var(--text-muted)`},children:a.role?.replace(`_`,` `)||`admin`})]})]}),(0,S.jsxs)(`div`,{onClick:e,style:{display:`flex`,alignItems:`center`,gap:`10px`,padding:`9px 10px`,borderRadius:`var(--radius-sm)`,cursor:`pointer`,color:`var(--text-muted)`,fontSize:`15px`,transition:`all 0.15s`},onMouseEnter:e=>{e.currentTarget.style.background=`var(--red-bg)`,e.currentTarget.style.color=`var(--red)`},onMouseLeave:e=>{e.currentTarget.style.background=`transparent`,e.currentTarget.style.color=`var(--text-muted)`},children:[(0,S.jsx)(v,{style:{fontSize:`15px`}}),` Sign Out`]})]})]});return(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(`style`,{children:`
        /* ── Desktop: spacer so main content shifts right ── */
        .sidebar-wrapper {
          display: flex;
          flex-shrink: 0;
          width: 220px;
          min-height: 100vh;
        }
        .hamburger-btn {
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

          .hamburger-btn {
            display: flex;
            position: fixed;
            top: 12px;
            left: 12px;
            z-index: 1200;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            background: var(--bg-surface);
            border: 1px solid var(--border-default);
            border-radius: var(--radius-sm);
            cursor: pointer;
            color: var(--text-secondary);
            box-shadow: var(--shadow-md);
            transition: all 0.15s;
          }
          .hamburger-btn:hover {
            border-color: var(--border-strong);
            color: var(--text-primary);
          }

          /* Overlay backdrop */
          .mobile-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.7);
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
            z-index: 1202;
            transform: translateX(0);
            animation: slideInDrawer 0.25s cubic-bezier(0.16,1,0.3,1);
            box-shadow: 4px 0 40px rgba(0,0,0,0.8);
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
      `}),(0,S.jsx)(`div`,{className:`sidebar-wrapper`,children:(0,S.jsx)(h,{})}),(0,S.jsx)(`button`,{className:`hamburger-btn`,onClick:()=>f(!0),"aria-label":`Open menu`,children:(0,S.jsx)(u,{style:{fontSize:`18px`}})}),l&&(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(`div`,{className:`mobile-overlay`}),(0,S.jsx)(`div`,{className:`mobile-drawer`,children:(0,S.jsx)(h,{})})]})]})}export{T as t};