import{i as e}from"./rolldown-runtime-aKtaBQYM.js";import{O as t}from"./charts-VUY9Sgpv.js";import{O as n,P as r,R as i,U as a,_ as o,i as s,it as c,l,lt as u,ut as d,v as f,x as p,y as m}from"./react-CNT2rLLL.js";import{n as h}from"./index-b5JQtfzI.js";import{t as g}from"./Sidebar-Dh5UoTVT.js";var _=e(t(),1),v=s(),y=e=>{let t=Math.floor((Date.now()-new Date(e))/1e3);return t<60?`just now`:t<3600?`${Math.floor(t/60)}m ago`:t<86400?`${Math.floor(t/3600)}h ago`:new Date(e).toLocaleDateString(`en-IN`,{day:`2-digit`,month:`short`,year:`numeric`})},b={membership_expired:{icon:n,color:`var(--red)`,bg:`var(--red-bg)`,label:`Expired`},membership_expiring:{icon:p,color:`var(--yellow)`,bg:`var(--yellow-bg)`,label:`Expiring`},equipment_maintenance:{icon:u,color:`var(--blue)`,bg:`var(--blue-bg)`,label:`Maintenance`},payment_pending:{icon:a,color:`var(--green)`,bg:`var(--green-bg)`,label:`Payment`},general:{icon:i,color:`#888`,bg:`rgba(136,136,136,0.1)`,label:`General`}};function x({onLogout:e}){let[t,n]=(0,_.useState)([]),[i,a]=(0,_.useState)(!0),[s,u]=(0,_.useState)(!1),[p,x]=(0,_.useState)(``),[S,C]=(0,_.useState)(!1),[w,T]=(0,_.useState)(1),[E,D]=(0,_.useState)(1),[O,k]=(0,_.useState)(0),[A,j]=(0,_.useState)(0),M=(0,_.useCallback)(async()=>{a(!0);try{let e=await h.get(`/notifications`,{params:{page:w,limit:15}}),t=e.data.data;p&&(t=t.filter(e=>e.type===p)),S&&(t=t.filter(e=>!e.is_read)),n(t),D(e.data.pagination.totalPages),k(e.data.pagination.total),j(t.filter(e=>!e.is_read).length)}catch(e){console.error(e)}finally{a(!1)}},[w,p,S]);(0,_.useEffect)(()=>{M()},[M]),(0,_.useEffect)(()=>{T(1)},[p,S]);let N=async()=>{u(!0);try{await h.post(`/notifications/sync`),M()}catch(e){console.error(e)}finally{u(!1)}},P=async e=>{try{await h.put(`/notifications/${e}/read`),n(t=>t.map(t=>t.id===e?{...t,is_read:1}:t)),j(e=>Math.max(0,e-1))}catch(e){console.error(e)}},F=async()=>{try{await h.put(`/notifications/mark-all/read`),n(e=>e.map(e=>({...e,is_read:1}))),j(0)}catch(e){console.error(e)}},I=async e=>{try{await h.delete(`/notifications/${e}`),n(t=>t.filter(t=>t.id!==e))}catch(e){console.error(e)}},L=async()=>{if(window.confirm(`Delete all read notifications?`))try{await h.delete(`/notifications/clear/read`),M()}catch(e){console.error(e)}},R=t.reduce((e,t)=>{let n=new Date(t.created_at).toLocaleDateString(`en-IN`,{day:`2-digit`,month:`long`,year:`numeric`});return e[n]||(e[n]=[]),e[n].push(t),e},{});return(0,v.jsxs)(`div`,{style:{display:`flex`,minHeight:`100vh`,background:`var(--bg-base)`,fontFamily:`var(--font-body)`},children:[(0,v.jsx)(g,{onLogout:e}),(0,v.jsxs)(`main`,{style:{flex:1,padding:`24px 20px`,overflowY:`auto`,minWidth:0},children:[(0,v.jsx)(`style`,{children:`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

          .notif-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 12px;
          }
          .notif-actions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }
          .notif-action-btn {
            display: flex; align-items: center; gap: 6px;
            padding: 9px 14px; border-radius: var(--radius-sm);
            background: var(--bg-elevated); border: 1px solid var(--border-default);
            color: var(--text-secondary); cursor: pointer; font-size: 13px;
            white-space: nowrap;
          }
          .notif-action-btn-red {
            background: var(--red-bg);
            border: 1px solid rgba(248,113,113,0.2);
            color: var(--red);
          }
          .notif-chips-bar {
            display: flex;
            gap: 8px;
            margin-bottom: 16px;
            overflow-x: auto;
            padding-bottom: 4px;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .notif-chips-bar::-webkit-scrollbar { display: none; }
          .notif-chip {
            display: flex; align-items: center; gap: 6px;
            padding: 6px 12px; border-radius: 99px; cursor: pointer;
            font-size: 12px; white-space: nowrap; flex-shrink: 0;
          }
          .notif-item {
            padding: 14px 16px;
            border-bottom: 1px solid var(--border-subtle);
            display: flex; gap: 12px; align-items: flex-start;
            transition: background 0.15s;
          }
          .notif-item-meta {
            display: flex; align-items: center; gap: 8px; flex-shrink: 0;
          }
          .notif-item-content {
            flex: 1; min-width: 0;
          }
          .notif-item-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 8px;
            margin-bottom: 4px;
          }

          @media (max-width: 768px) {
            .notif-main-padding {
              padding: 16px 14px !important;
            }
            .notif-action-btn span.btn-label {
              display: none;
            }
            .notif-action-btn {
              padding: 9px 10px;
            }
            .notif-header h1 {
              font-size: 22px !important;
            }
          }

          @media (max-width: 480px) {
            .notif-item {
              padding: 12px 14px;
            }
          }
        `}),(0,v.jsxs)(`div`,{className:`notif-header fade-up`,children:[(0,v.jsxs)(`div`,{children:[(0,v.jsx)(`h1`,{style:{fontFamily:`var(--font-display)`,fontSize:`31px`,fontWeight:800,color:`var(--text-primary)`,letterSpacing:`-0.5px`,margin:0},children:`Notifications`}),(0,v.jsxs)(`p`,{style:{color:`var(--text-muted)`,fontSize:`15px`,marginTop:`4px`},children:[A>0?(0,v.jsxs)(`span`,{style:{color:`var(--red)`},children:[A,` unread`]}):`All caught up`,` — `,O,` total`]})]}),(0,v.jsxs)(`div`,{className:`notif-actions`,children:[(0,v.jsxs)(`button`,{onClick:N,disabled:s,className:`notif-action-btn`,style:{opacity:s?.6:1},children:[(0,v.jsx)(c,{style:{fontSize:`12px`,animation:s?`spin 1s linear infinite`:`none`}}),(0,v.jsx)(`span`,{className:`btn-label`,children:s?`Syncing...`:`Sync Alerts`})]}),A>0&&(0,v.jsxs)(`button`,{onClick:F,className:`notif-action-btn`,children:[(0,v.jsx)(o,{style:{fontSize:`12px`}}),(0,v.jsx)(`span`,{className:`btn-label`,children:`Mark All Read`})]}),(0,v.jsxs)(`button`,{onClick:L,className:`notif-action-btn notif-action-btn-red`,children:[(0,v.jsx)(d,{style:{fontSize:`12px`}}),(0,v.jsx)(`span`,{className:`btn-label`,children:`Clear Read`})]})]})]}),(0,v.jsxs)(`div`,{className:`notif-chips-bar`,children:[Object.entries(b).map(([e,n])=>{let r=n.icon,i=t.filter(t=>t.type===e).length,a=p===e;return(0,v.jsxs)(`button`,{className:`notif-chip`,onClick:()=>x(a?``:e),style:{background:a?n.color:`var(--bg-elevated)`,border:`1px solid ${a?n.color:`var(--border-default)`}`,color:a?`#0a0a0a`:`var(--text-muted)`},children:[(0,v.jsx)(r,{style:{fontSize:`11px`}}),n.label,(0,v.jsx)(`span`,{style:{padding:`1px 6px`,borderRadius:`99px`,fontSize:`11px`,fontWeight:700,background:a?n.color:`var(--bg-surface)`,color:a?`#0a0a0a`:`var(--text-muted)`},children:i})]},e)}),(0,v.jsxs)(`button`,{className:`notif-chip`,onClick:()=>C(e=>!e),style:{background:S?`var(--red-bg)`:`var(--bg-elevated)`,border:`1px solid ${S?`var(--red)`:`var(--border-default)`}`,color:S?`var(--red)`:`var(--text-muted)`},children:[(0,v.jsx)(r,{style:{fontSize:`11px`}}),` Unread only`]})]}),(0,v.jsxs)(`div`,{style:{background:`var(--bg-surface)`,border:`1px solid var(--border-subtle)`,borderRadius:`var(--radius-lg)`,overflow:`hidden`},children:[i?[...[,,,,,]].map((e,t)=>(0,v.jsxs)(`div`,{style:{padding:`16px 20px`,borderBottom:`1px solid var(--border-subtle)`,display:`flex`,gap:`12px`},children:[(0,v.jsx)(`div`,{style:{width:`36px`,height:`36px`,borderRadius:`8px`,background:`var(--bg-elevated)`,flexShrink:0}}),(0,v.jsxs)(`div`,{style:{flex:1},children:[(0,v.jsx)(`div`,{style:{height:`12px`,width:`40%`,background:`var(--bg-elevated)`,borderRadius:`4px`,marginBottom:`8px`}}),(0,v.jsx)(`div`,{style:{height:`11px`,width:`70%`,background:`var(--bg-elevated)`,borderRadius:`4px`}})]})]},t)):t.length===0?(0,v.jsxs)(`div`,{style:{padding:`60px 20px`,textAlign:`center`},children:[(0,v.jsx)(l,{style:{fontSize:`45px`,color:`var(--text-muted)`,opacity:.2,display:`block`,margin:`0 auto 14px`}}),(0,v.jsx)(`p`,{style:{color:`var(--text-secondary)`,fontSize:`16px`,margin:`0 0 6px`,fontWeight:600},children:`No notifications`}),(0,v.jsx)(`p`,{style:{color:`var(--text-muted)`,fontSize:`13px`,margin:0},children:`Click "Sync Alerts" to check for new alerts`})]}):Object.entries(R).map(([e,t])=>(0,v.jsxs)(`div`,{children:[(0,v.jsx)(`div`,{style:{padding:`8px 16px`,background:`var(--bg-elevated)`,borderBottom:`1px solid var(--border-subtle)`,fontSize:`12px`,fontWeight:600,color:`var(--text-muted)`,textTransform:`uppercase`,letterSpacing:`0.08em`},children:e}),t.map(e=>{let t=b[e.type]||b.general,n=t.icon;return(0,v.jsxs)(`div`,{className:`notif-item`,style:{background:e.is_read?`transparent`:`rgba(255,255,255,0.015)`,borderLeft:e.is_read?`3px solid transparent`:`3px solid ${t.color}`},onMouseEnter:e=>e.currentTarget.style.background=`var(--bg-elevated)`,onMouseLeave:t=>t.currentTarget.style.background=e.is_read?`transparent`:`rgba(255,255,255,0.015)`,children:[(0,v.jsx)(`div`,{style:{width:`36px`,height:`36px`,borderRadius:`8px`,flexShrink:0,background:t.bg,display:`flex`,alignItems:`center`,justifyContent:`center`,color:t.color},children:(0,v.jsx)(n,{style:{fontSize:`16px`}})}),(0,v.jsxs)(`div`,{className:`notif-item-content`,children:[(0,v.jsxs)(`div`,{className:`notif-item-top`,children:[(0,v.jsx)(`span`,{style:{fontSize:`15px`,fontWeight:e.is_read?500:700,color:e.is_read?`var(--text-secondary)`:`var(--text-primary)`,lineHeight:1.4},children:e.title}),(0,v.jsxs)(`div`,{className:`notif-item-meta`,children:[!e.is_read&&(0,v.jsx)(`span`,{style:{width:`7px`,height:`7px`,borderRadius:`50%`,background:t.color,display:`inline-block`,flexShrink:0}}),(0,v.jsx)(`span`,{style:{fontSize:`12px`,color:`var(--text-muted)`,whiteSpace:`nowrap`},children:y(e.created_at)})]})]}),(0,v.jsx)(`p`,{style:{fontSize:`13px`,color:`var(--text-muted)`,margin:`0 0 8px`,lineHeight:1.6},children:e.message}),(0,v.jsxs)(`div`,{style:{display:`flex`,gap:`10px`},children:[!e.is_read&&(0,v.jsxs)(`button`,{onClick:()=>P(e.id),style:{background:`none`,border:`none`,cursor:`pointer`,padding:0,color:`var(--text-muted)`,fontSize:`12px`,display:`flex`,alignItems:`center`,gap:`4px`},onMouseEnter:e=>e.currentTarget.style.color=`var(--green)`,onMouseLeave:e=>e.currentTarget.style.color=`var(--text-muted)`,children:[(0,v.jsx)(o,{style:{fontSize:`11px`}}),` Mark as read`]}),(0,v.jsxs)(`button`,{onClick:()=>I(e.id),style:{background:`none`,border:`none`,cursor:`pointer`,padding:0,color:`var(--text-muted)`,fontSize:`12px`,display:`flex`,alignItems:`center`,gap:`4px`},onMouseEnter:e=>e.currentTarget.style.color=`var(--red)`,onMouseLeave:e=>e.currentTarget.style.color=`var(--text-muted)`,children:[(0,v.jsx)(d,{style:{fontSize:`11px`}}),` Remove`]})]})]})]},e.id)})]},e)),E>1&&(0,v.jsxs)(`div`,{style:{padding:`14px 16px`,display:`flex`,justifyContent:`space-between`,alignItems:`center`},children:[(0,v.jsxs)(`span`,{style:{fontSize:`13px`,color:`var(--text-muted)`},children:[`Page `,w,` of `,E]}),(0,v.jsxs)(`div`,{style:{display:`flex`,gap:`6px`},children:[(0,v.jsx)(`button`,{onClick:()=>T(e=>Math.max(1,e-1)),disabled:w===1,style:{padding:`6px 10px`,borderRadius:`var(--radius-sm)`,background:`var(--bg-elevated)`,border:`1px solid var(--border-default)`,color:w===1?`var(--text-muted)`:`var(--text-secondary)`,cursor:w===1?`not-allowed`:`pointer`},children:(0,v.jsx)(f,{})}),(0,v.jsx)(`button`,{onClick:()=>T(e=>Math.min(E,e+1)),disabled:w===E,style:{padding:`6px 10px`,borderRadius:`var(--radius-sm)`,background:`var(--bg-elevated)`,border:`1px solid var(--border-default)`,color:w===E?`var(--text-muted)`:`var(--text-secondary)`,cursor:w===E?`not-allowed`:`pointer`},children:(0,v.jsx)(m,{})})]})]})]})]})]})}export{x as default};