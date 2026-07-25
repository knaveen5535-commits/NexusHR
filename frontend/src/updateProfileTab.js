const fs = require('fs');

const filePath = 'd:/ZIDIO DEVELOPMENT/NexusHR/frontend/src/components/profile/ProfileTab.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const badgeCode = `
const PendingBadge = () => (
  <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500 border border-amber-500/20">
    Pending
  </span>
);
`;

if (!content.includes('PendingBadge')) {
    content = content.replace('export default function ProfileTab() {', badgeCode + '\nexport default function ProfileTab() {');
}

// In curly braces: {profile.something || 'Not Available'} -> {profile.something || <PendingBadge />}
content = content.replace(/\|\|\s*'Not Available'/g, '|| <PendingBadge />');
content = content.replace(/\|\|\s*'N\/A'/g, '|| <PendingBadge />');

fs.writeFileSync(filePath, content);
console.log('ProfileTab.tsx updated');
