import type { AdminProject, ProjectResult, UserProfile } from './types';
import { projectImageForCode } from './project-images';
import { projectCategoryOptions, type ProjectCategory } from './project-categories';

export { projectCategoryOptions };

export const projects: AdminProject[] = [
  ['p1','01','Tide Lines','A tiny coastal sensor that turns shoreline data into a living soundscape.','Our team built a low-cost sensor buoy that measures salinity, temperature and tide movement. The installation translates each reading into a changing musical composition, making an invisible ecosystem audible to visitors.','Information Science','The Blue Current','1461151753365-8d4d7d15a7be','Water, science','Visual data'],
  ['p2','02','Borrowed Light','A solar reading nook designed for the school’s forgotten corners.','A modular reading seat that stores daylight during the afternoon and releases a soft glow after sunset. We combined recycled timber, flexible solar film and a simple battery circuit.','Computer Engineering','Studio 4B','1500534623283-312aade485b7','Recycled materials','Solar circuit'],
  ['p3','03','The Memory Garden','A tactile garden that preserves the stories of people who shaped our school.','Visitors explore plantings chosen for their cultural meanings while listening to recorded memories from alumni, caretakers and neighbours. The garden grows as the community contributes.','Electronic Engineering','Common Ground','1497250681960-ef046c4e94d2','Oral history','Community archive'],
  ['p4','04','Air We Share','Mapping invisible air currents through the school day.','A network of handmade paper pinwheels and open-source monitors reveals how air moves from classroom to classroom. The project pairs rigorous observation with a very human question: who gets the freshest air?','Precision Engineering','North Wing Lab','1535378917042-10a22c3a2f9c','Air quality','Open data'],
  ['p5','05','Second Skin','A collection of garments grown from food waste.','We experimented with bacterial cellulose made from fruit scraps, developing translucent sheets that can be stitched, dyed and composted at the end of their life.','Advanced Material Engineering','Mend / Make','1529139574466-a303027c1d8b','Bio-materials','Circular design'],
  ['p6','06','Small Acts, Big Map','A neighbourhood map built from everyday acts of care.','Every mark on this hand-drawn map represents a small act of care: a repaired bike, a shared meal, a borrowed book. It asks us to notice the infrastructure of kindness around us.','Information Science','The Listening Post','1529156069898-49953e39b3ac','Field notes','Participatory map'],
  ['p7','07','Night Sky Radio','An interactive radio broadcast from the edge of the visible universe.','Tune across a room-sized radio to hear the mathematics of stars become rhythm and texture. The project makes astronomical scale intimate through sound, light and a lot of careful coding.','Computer Engineering','Signal / Noise','1444703686981-a3abbc4e11d8','Radio astronomy','Generative sound'],
  ['p8','08','Kitchen Table Atlas','Recipes and migration stories from our school community.','A printed atlas maps family recipes to the journeys that brought them here. Each page begins with a dish and opens into a story about memory, language and the places we carry.','Electronic Engineering','Many Tables','1556911220-bff31c812dba','Food stories','Print atlas'],
  ['p9','09','The Quiet Machine','A kinetic sculpture that responds to the sounds of a room.','When the room is loud, the machine folds in on itself. When it is quiet, it unfolds slowly. Our sculpture turns collective attention into a visible, shared choreography.','Precision Engineering','Soft Mechanisms','1531058020387-3be344556be6','Kinetic sculpture','Sound reactive'],
  ['p10','10','Pocket Pollinators','A pocket-sized habitat kit for balconies and window ledges.','A kit of seed cards, nesting tubes and illustrated instructions helps people make small habitats wherever they live. We tested the kits with neighbours across three apartment blocks.','Advanced Material Engineering','Wild Window','1497250681960-ef046c4e94d2','Urban ecology','Take-home kit'],
  ['p11','11','Language Weather','A forecast made from the words our school uses every day.','We collected anonymous snippets of school language and visualised their mood over a month. The result is a changing weather map that reflects how a community speaks to itself.','Information Science','Word Watch','1499750310107-5fef28a66643','Text analysis','Community research'],
  ['p12','12','Repair Radio','A broadcast studio for fixing things and telling their stories.','Every repaired object has a history. Our pop-up radio station records those histories while teaching basic repair skills, creating a practical archive of how things stay useful.','Computer Engineering','Fixers Collective','1518770660439-4636190af475','Repair culture','Live broadcast'],
].map(([id, number, title, shortDescription, _fullDescription, category, teamName, seed, f1, f2]) => ({
  id, title, shortDescription, category: category as ProjectCategory, teamName,
  hiddenProjectCode: `PC${String(number).padStart(3, '0')}`,
  imageUrl: projectImageForCode(`PC${number}`), isActive: true, isArchived: false, features: [f1, f2],
}));

const names = ['Mira Shah','Jon Bell','Amara Nwosu','Theo Park','Lena Ortiz','Samir Khan','Nia Williams','Eli Mercer','Priya Rao','Hugo Clarke','Ava Chen','Noah Green','Ruby James','Mateo Silva','Sofia Kim','Arjun Patel','Iris Stone','Finn Lewis','Zoe Martin','Owen Wright','Maya Brooks','Leo Grant','Sara Ali','Max Turner','Anika Das','Ben Foster','Chloe Reed','Ethan Cole','Layla Scott','Tom Nguyen','Rosa Moore','Caleb Young'];
export const users: UserProfile[] = names.map((name, i) => ({
  id: `u${i + 1}`, name, email: `${name.toLowerCase().replace(' ', '.')}@campus-nexus.university`,
  category: (['student','teacher','visitor'] as const)[i % 3],
  categoryStatus: i % 9 === 0 ? 'pending' : i % 13 === 0 ? 'rejected' : 'verified',
  hasVoted: i < 23, registeredAt: `2025-05-${String((i % 20) + 1).padStart(2,'0')}T${String(8 + i % 9).padStart(2,'0')}:20:00`,
  votedAt: i < 23 ? `2025-05-20T${String(9 + i % 8).padStart(2,'0')}:4${i % 10}:00` : undefined,
}));

const raw = [[22,14,9],[18,11,16],[15,17,8],[12,9,14],[10,13,7],[9,8,12],[8,11,6],[7,9,8],[6,7,9],[5,8,6],[4,6,7],[3,5,5]];
export const results: ProjectResult[] = raw.map((votes, i) => {
  const totalVotes = votes[0] + votes[1] + votes[2];
  return { projectId: projects[i].id, studentVotes: votes[0], teacherVotes: votes[1], visitorVotes: votes[2], totalVotes, totalPoints: votes[0] + votes[1] * 2 + votes[2] * 3, rank: i + 1 };
});

export const categoryLabels = { student: 'Student', teacher: 'Teacher', visitor: 'Visitor' };
export const pointValues = { student: 1, teacher: 2, visitor: 3 };
