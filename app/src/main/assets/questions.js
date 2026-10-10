// ============================================================================
//  A/L STREAK: CONTENT FILE
//  Edit this file on GitHub (pencil icon) and commit. A new app build runs.
//
//  Each CHAPTER has short "notes" cards (shown before the first lesson) and a
//  list of questions. Question helpers (last argument "src" is optional and
//  records where the question came from, e.g. 'A/L 2019 Paper I Q12'):
//
//    mcq  (question, CORRECT answer, [3 wrong answers], explanation, src)
//    tf   (statement, true/false, explanation, src)
//    fill (question with ___ blank, answer or [accepted answers], explanation, src)
//    match(instruction, [[left, right], ...], explanation, src)      3 to 5 pairs
//    order(instruction, [items in the CORRECT order], explanation, src)
//
//  Subject codes: A = Accounting, B = Business Studies, E = Economics, I = ICT
//  Keep a chapter's title the same once students have used it (their progress
//  is saved under the title).
// ============================================================================

const SUBJECTS = {
  A: { name: 'Accounting',        icon: '📒', color: '#A9EBCB' },
  B: { name: 'Business Studies',  icon: '🏢', color: '#FFC9A3' },
  E: { name: 'Economics',         icon: '📈', color: '#FFE680' },
  I: { name: 'ICT',               icon: '💻', color: '#A9C0FF' }
};

const mcq   = (q, a, w, e, src) => ({ t: 'mcq',   q, a, w, e, src });
const tf    = (q, a, e, src)    => ({ t: 'tf',    q, a, e, src });
const fill  = (q, a, e, src)    => ({ t: 'fill',  q, a: [].concat(a), e, src });
const match = (q, pairs, e, src)=> ({ t: 'match', q, pairs, e, src });
const order = (q, items, e, src)=> ({ t: 'order', q, items, e, src });
const ch    = (s, title, icon, notes, qs) => ({ s, title, icon, notes, qs });

const CHAPTERS = [

// ───────────────────────────── ACCOUNTING ─────────────────────────────
ch('A', 'Double entry', '📒', [
  { h: 'Every deal has two sides', b: 'Each transaction changes at least two accounts. One is debited and one is credited, and the two amounts are equal.', k: 'Total debits = Total credits' },
  { h: 'Which side?', b: 'Assets and expenses increase on the debit side. Liabilities, capital and income increase on the credit side.', k: 'Dr: assets, expenses · Cr: liabilities, capital, income' }
], [
  mcq('Goods purchased on credit from Perera. Which entry is correct?', 'Dr Purchases, Cr Perera (creditor)', ['Dr Perera, Cr Purchases', 'Dr Purchases, Cr Cash', 'Dr Cash, Cr Purchases'], 'Goods in = debit Purchases. Owing the supplier creates a liability, so credit the creditor.'),
  mcq('The owner introduces Rs 200,000 cash into the business. Which entry is correct?', 'Dr Cash, Cr Capital', ['Dr Capital, Cr Cash', 'Dr Cash, Cr Drawings', 'Dr Drawings, Cr Cash'], 'Cash (an asset) increases, so debit it. The owner\'s capital increases, so credit it.'),
  tf('Every transaction affects at least two accounts.', true, 'That is what "double entry" means: each transaction has a debit and a credit of equal value.'),
  match('Match each transaction to its entry.', [
    ['Paid rent by cash', 'Dr Rent, Cr Cash'],
    ['Sold goods for cash', 'Dr Cash, Cr Sales'],
    ['Owner took cash for personal use', 'Dr Drawings, Cr Cash'],
    ['Bought machinery on credit', 'Dr Machinery, Cr Creditor']
  ], 'Work out which account gains value (debit) and where the value came from (credit).')
]),

ch('A', 'Final accounts', '🧾', [
  { h: 'Gross profit', b: 'Gross profit is what is left of sales after paying for the goods that were sold.', k: 'Gross profit = Sales − Cost of sales' },
  { h: 'Cost of sales', b: 'Not just purchases! Adjust for stock at the start and at the end of the year.', k: 'Opening stock + Purchases − Closing stock' }
], [
  mcq('Gross profit equals:', 'Sales − Cost of sales', ['Sales − All expenses', 'Net profit + Drawings', 'Sales − Purchases only'], 'Gross profit uses cost of sales (opening stock + purchases − closing stock), not purchases alone.'),
  mcq('Opening stock Rs 20,000, purchases Rs 150,000, closing stock Rs 30,000. What is the cost of sales?', 'Rs 140,000', ['Rs 160,000', 'Rs 150,000', 'Rs 200,000'], 'Cost of sales = 20,000 + 150,000 − 30,000 = 140,000.'),
  fill('Sales are Rs 500,000 and cost of sales is Rs 320,000. Gross profit = Rs ___', ['180000'], '500,000 − 320,000 = 180,000.'),
  tf('Drawings are shown as an expense in the income statement.', false, 'Drawings are the owner\'s withdrawals. They reduce capital and are not an expense of the business.')
]),

ch('A', 'Bank reconciliation', '🏦', [
  { h: 'Two records, one bank balance', b: 'The cash book (your record) and the bank statement (the bank\'s record) often differ because of timing and items you have not yet recorded.', k: 'Update the cash book first, then reconcile' },
  { h: 'Common differences', b: 'Unpresented cheques and uncredited deposits are timing differences. Bank charges, direct debits and dishonoured cheques must be entered in the cash book.', k: 'Timing → reconciliation · Unrecorded → cash book' }
], [
  mcq('An unpresented cheque makes the bank statement balance:', 'Higher than the cash book', ['Lower than the cash book', 'Equal to it', 'Unaffected'], 'The cash book already deducted the cheque; the bank has not yet, so the statement shows more.'),
  mcq('Bank charges on the statement are not yet in the cash book. The cash book needs to be:', 'Credited with the charges', ['Debited with the charges', 'Left unchanged', 'Debited with double the charges'], 'Charges reduce the money in the bank, so credit the cash book.'),
  tf('A customer\'s cheque that is dishonoured (bounced) must be credited in the cash book.', true, 'The receipt was already debited. The bank reversed it, so the cash book balance must be reduced.'),
  fill('Cash book balance Rs 50,000. Unpresented cheques Rs 8,000. The bank statement balance = Rs ___', ['58000'], 'The bank has not deducted the cheques yet, so the statement shows 50,000 + 8,000 = 58,000.')
]),

ch('A', 'Depreciation', '📉', [
  { h: 'Why depreciate?', b: 'A machine helps earn money for many years. Depreciation spreads its cost over those years. It is an accounting entry and no cash is paid.', k: 'Depreciation ≠ cash payment' },
  { h: 'Two methods', b: 'Straight-line charges the same amount each year. Reducing balance charges a fixed % of the remaining book value, so the charge falls every year.', k: '(Cost − Residual) ÷ Life' }
], [
  mcq('Cost Rs 100,000, residual Rs 10,000, life 5 years. Straight-line annual charge?', 'Rs 18,000', ['Rs 20,000', 'Rs 22,000', 'Rs 16,000'], '(100,000 − 10,000) ÷ 5 = 18,000.'),
  mcq('Which method charges the same depreciation every year?', 'Straight-line', ['Reducing balance', 'Revaluation', 'Sum of the years'], 'Straight-line spreads cost minus residual value evenly over the useful life.'),
  fill('A machine costs Rs 240,000, has no residual value and lasts 8 years. Annual straight-line depreciation = Rs ___', ['30000'], '240,000 ÷ 8 = 30,000.'),
  tf('Depreciation means the business pays out cash each year.', false, 'Depreciation is a book entry that spreads the cost. The cash was paid when the asset was bought.')
]),

// ───────────────────────────── BUSINESS STUDIES ─────────────────────────────
ch('B', 'Business activities', '🌾', [
  { h: 'Three sectors', b: 'Primary businesses take things from nature. Secondary businesses turn materials into products. Tertiary businesses provide services.', k: 'Primary · Secondary · Tertiary' },
  { h: 'Example: tea', b: 'Plucking tea leaves is primary. Making packed tea is secondary. A shop selling tea, or a bank lending to the estate, is tertiary.' }
], [
  mcq('Which of these is a primary sector activity?', 'Plucking tea leaves', ['Packing tea into boxes', 'Selling tea in a supermarket', 'Insuring a tea factory'], 'Primary activities extract or grow natural resources.'),
  tf('Insurance is a tertiary (service) sector activity.', true, 'Insurance provides a service, so it belongs to the tertiary sector.'),
  fill('Business activities are grouped into primary, secondary and ___ sectors.', ['tertiary'], 'The three sectors are primary, secondary and tertiary.'),
  match('Match the sector with what it does.', [
    ['Primary', 'Extracts or grows natural resources'],
    ['Secondary', 'Converts materials into goods'],
    ['Tertiary', 'Provides services']
  ], 'Think raw materials → products → services.')
]),

ch('B', 'Forms of ownership', '🤝', [
  { h: 'Who owns the business?', b: 'A sole proprietor has one owner. A partnership has two or more owners. A company is owned by shareholders.', k: 'Sole trader · Partnership · Company' },
  { h: 'Liability', b: 'A sole proprietor and partners have unlimited liability. They can lose personal assets. Shareholders of a company have limited liability, and a company is a separate legal entity.', k: 'Limited liability = loss limited to money invested' }
], [
  mcq('Which type of business has a single owner with unlimited liability?', 'Sole proprietorship', ['Public limited company', 'Private limited company', 'Co-operative society'], 'A sole proprietor owns and runs the business and is personally responsible for its debts.'),
  mcq('The owners of a company are called:', 'Shareholders', ['Partners', 'Directors only', 'Creditors'], 'A company is owned by its shareholders.'),
  tf('Shareholders of a limited company are personally liable for all of the company\'s debts.', false, 'Limited liability means shareholders can lose only the money they invested.'),
  match('Match each form of ownership with its feature.', [
    ['Sole proprietor', 'One owner, unlimited liability'],
    ['Partnership', 'Two or more owners share profits'],
    ['Limited company', 'Separate legal entity, limited liability']
  ], 'Look at the number of owners and who is liable for the debts.')
]),

ch('B', 'Management functions', '🧭', [
  { h: 'The management process', b: 'Managers plan what to do, organise people and resources, direct and motivate staff, then control by checking results.', k: 'Plan → Organise → Direct → Control' },
  { h: 'Control closes the loop', b: 'Controlling compares actual results with the plan and takes corrective action. The lessons feed the next plan.' }
], [
  mcq('Setting objectives and deciding how to achieve them is the function of:', 'Planning', ['Controlling', 'Organising', 'Directing'], 'Planning comes first: what do we want, and how will we get there?'),
  order('Put the management process in order.', ['Planning', 'Organising', 'Directing', 'Controlling'], 'Plan first, organise resources, direct people, then control by checking results.'),
  tf('Controlling compares actual results with plans and takes corrective action.', true, 'Control makes sure the business stays on track.'),
  match('Match each management function to what it involves.', [
    ['Planning', 'Deciding goals and methods'],
    ['Organising', 'Arranging tasks and resources'],
    ['Directing', 'Motivating and guiding staff'],
    ['Controlling', 'Checking results against plans']
  ], 'Each function has its own job in the management cycle.')
]),

ch('B', 'Marketing mix', '📣', [
  { h: 'The 4 Ps', b: 'Product (what we sell), Price (what customers pay), Place (how it reaches them), Promotion (how we tell them about it).', k: 'Product · Price · Place · Promotion' },
  { h: 'Segmentation', b: 'Dividing a market into groups with similar needs lets a business target the right customers with the right mix.' }
], [
  mcq('The 4 Ps of the marketing mix are:', 'Product, Price, Place, Promotion', ['Product, Profit, People, Planning', 'Price, Policy, Place, Packaging', 'Promotion, People, Process, Profit'], 'The classic marketing mix is Product, Price, Place and Promotion.'),
  mcq('Using TV and social media adverts to tell customers about a product is part of:', 'Promotion', ['Place', 'Product', 'Price'], 'Promotion means communicating with customers to persuade them to buy.'),
  tf('Market segmentation means dividing a market into groups of customers with similar needs.', true, 'Segmentation helps a business target customers more precisely.'),
  match('Match each P with what it covers.', [
    ['Product', 'Quality, design and brand'],
    ['Price', 'What the customer pays'],
    ['Place', 'How goods reach customers'],
    ['Promotion', 'Advertising and sales offers']
  ], 'Each P is one decision area of the marketing mix.')
]),

// ───────────────────────────── ECONOMICS ─────────────────────────────
ch('E', 'Demand & supply', '⚖️', [
  { h: 'Moving vs shifting', b: 'A change in the good\'s own price moves you along the curve. Any other factor (income, tastes, costs, technology) shifts the whole curve.', k: 'Own price → movement · Other factors → shift' },
  { h: 'Finding equilibrium', b: 'Price settles where demand meets supply. If supply shifts right, the price falls and the quantity traded rises.' }
], [
  mcq('A rise in the price of a substitute will:', 'Increase demand for the good', ['Decrease demand for the good', 'Shift the supply curve', 'Have no effect'], 'Buyers switch toward the now-cheaper good, shifting its demand right.'),
  mcq('Supply shifts right while demand is unchanged. Equilibrium will show:', 'Lower price, higher quantity', ['Higher price, higher quantity', 'Higher price, lower quantity', 'Lower price, lower quantity'], 'More supply at every price pushes the price down and the quantity traded up.'),
  tf('A rise in income always increases the demand for every good.', false, 'For normal goods demand rises with income, but for inferior goods it falls.'),
  match('Match each event with its effect.', [
    ['Price of the good falls', 'Movement along the demand curve'],
    ['Income rises (normal good)', 'Demand curve shifts right'],
    ['Cost of production rises', 'Supply curve shifts left'],
    ['New technology improves output', 'Supply curve shifts right']
  ], 'Own-price changes move along a curve; everything else shifts it.')
]),

ch('E', 'Elasticity', '🪢', [
  { h: 'How sensitive?', b: 'Price elasticity of demand (PED) measures how much quantity demanded responds to a price change.', k: 'PED = %ΔQd ÷ %ΔP' },
  { h: 'Reading the number', b: 'Ignoring the sign: above 1 is elastic, below 1 is inelastic, equal to 1 is unitary. Necessities tend to be inelastic.' }
], [
  mcq('Price rises 10% and quantity demanded falls 20%. PED is:', '−2 (elastic)', ['−0.5 (inelastic)', '−1 (unitary)', '−10'], 'PED = %ΔQ ÷ %ΔP = −20 ÷ 10 = −2, so demand is elastic.'),
  mcq('Demand is inelastic and the firm raises its price. Total revenue will:', 'Rise', ['Fall', 'Stay the same', 'Fall to zero'], 'Quantity falls by a smaller percentage than price rises, so revenue goes up.'),
  fill('Price rises 5% and quantity demanded falls 15%. Ignoring the sign, PED = ___', ['3'], '15 ÷ 5 = 3, so demand is elastic.'),
  tf('Necessities such as salt usually have inelastic demand.', true, 'People keep buying them even when the price rises.')
]),

ch('E', 'National income', '🏛️', [
  { h: 'What GDP counts', b: 'GDP is the value of final goods and services produced inside a country in a year. Only final output is counted, to avoid double counting.', k: 'GDP = final output within borders' },
  { h: 'What GDP skips', b: 'Transfer payments (like welfare) and second-hand sales do not create new output, so they are left out.' }
], [
  mcq('GDP at market prices measures:', 'Value of final goods and services produced within a country in a year', ['Value of all transactions', 'Only exports', 'Government spending only'], 'GDP counts final output only, to avoid double counting.'),
  mcq('Which item is a transfer payment, so it is not counted in GDP?', 'Government welfare payments', ['Wages of teachers', 'Purchase of new machinery', 'Exports of tea'], 'Transfer payments move money around without any new production in return.'),
  tf('In GDP we add the value of the flour and also the value of the bread made from it.', false, 'That would be double counting. Count only the final bread (or only the value added at each stage).'),
  fill('GDP is Rs 900,000 million and the population is 30 million. GDP per capita = Rs ___', ['30000'], '900,000 ÷ 30 = 30,000 per person.')
]),

ch('E', 'Market structures', '🏪', [
  { h: 'A spectrum', b: 'From perfect competition (many price-taking sellers) to monopoly (one seller with high barriers). In between: oligopoly and monopolistic competition.', k: 'Number of sellers · Product type · Entry barriers' },
  { h: 'Profit maximising', b: 'Every firm maximises profit where marginal revenue equals marginal cost.', k: 'MR = MC' }
], [
  mcq('A feature of perfect competition:', 'Many sellers, homogeneous product', ['A single seller', 'Few large sellers', 'Branded, differentiated goods'], 'Firms are price takers selling identical products.'),
  mcq('A profit-maximising monopolist produces where:', 'MR = MC', ['P = AC', 'MR = AR', 'Total revenue is highest'], 'Profit is greatest at the output where marginal revenue equals marginal cost.'),
  tf('In perfect competition firms can earn abnormal profit in the long run.', false, 'New firms enter when there is abnormal profit, which pushes the price down until only normal profit is left.'),
  match('Match each market structure with its description.', [
    ['Perfect competition', 'Price takers, identical products'],
    ['Monopoly', 'One seller, high barriers to entry'],
    ['Oligopoly', 'A few large, interdependent firms'],
    ['Monopolistic competition', 'Many sellers, differentiated products']
  ], 'Compare the number of sellers and how different their products are.')
]),

// ───────────────────────────── ICT ─────────────────────────────
ch('I', 'Number systems', '🔢', [
  { h: 'Binary', b: 'Computers use base 2. Each place is a power of two: 8, 4, 2, 1 for a 4-bit number.', k: '1011₂ = 8 + 2 + 1 = 11' },
  { h: 'Hexadecimal', b: 'Base 16 is a short way to write binary. It uses 0 to 9 and A to F, where A = 10 and F = 15.' }
], [
  mcq('Binary 1011 in decimal is:', '11', ['13', '9', '10'], '8 + 0 + 2 + 1 = 11.'),
  mcq('Decimal 13 in binary is:', '1101', ['1011', '1110', '1001'], '13 = 8 + 4 + 1, so 1101.'),
  fill('Convert binary 1100 to decimal: ___', ['12'], '8 + 4 = 12.'),
  tf('Hexadecimal uses the digits 0 to 9 and the letters A to F.', true, 'Base 16 needs 16 symbols, so letters stand for 10 to 15.'),
  match('Match each binary number with its decimal value.', [
    ['101', '5'], ['110', '6'], ['111', '7'], ['1000', '8']
  ], 'Add the place values wherever there is a 1.')
]),

ch('I', 'Logic gates', '🔌', [
  { h: 'Gates in one line each', b: 'AND needs both inputs 1. OR needs at least one input 1. NOT flips the input. XOR is 1 when the inputs differ.', k: 'AND · OR · NOT · XOR' },
  { h: 'Combined gates', b: 'NAND is AND followed by NOT. NOR is OR followed by NOT. Their outputs are the opposite of AND and OR.' }
], [
  mcq('AND gate output when inputs are 1 and 0:', '0', ['1', 'Undefined', '10'], 'AND outputs 1 only when both inputs are 1.'),
  mcq('OR gate output when both inputs are 0:', '0', ['1', 'Undefined', '10'], 'OR outputs 1 if at least one input is 1. Here neither is.'),
  fill('A NOT gate has input 1. Its output is ___', ['0'], 'NOT flips the input.'),
  match('Match each gate with its rule.', [
    ['AND', 'Output 1 only if both inputs are 1'],
    ['OR', 'Output 1 if any input is 1'],
    ['NOT', 'Flips the input'],
    ['XOR', 'Output 1 if the inputs differ']
  ], 'Think about when each gate gives a 1.')
]),

ch('I', 'Networking', '🌐', [
  { h: 'Network sizes', b: 'A LAN covers a small area such as a school. A WAN covers a large area; the Internet is the biggest WAN.', k: 'LAN · WAN' },
  { h: 'Devices', b: 'A switch connects devices inside a LAN. A router connects different networks and chooses paths for packets.' }
], [
  mcq('Which device forwards packets between different networks?', 'Router', ['Hub', 'Repeater', 'Network cable'], 'Routers connect separate networks and choose paths for packets.'),
  mcq('Which topology connects every device to a central switch?', 'Star', ['Bus', 'Ring', 'Mesh'], 'In a star topology each device has its own link to the central switch or hub.'),
  tf('A LAN usually covers a small area such as a school or an office.', true, 'LAN stands for Local Area Network.'),
  match('Match each term with its meaning.', [
    ['LAN', 'Network in a small area'],
    ['WAN', 'Network over a large area'],
    ['Router', 'Connects different networks'],
    ['Switch', 'Connects devices inside a LAN']
  ], 'Size of network and job of the device are the clues.')
]),

ch('I', 'Databases', '🗄️', [
  { h: 'Tables, records, fields', b: 'A database stores data in tables. Each row is a record and each column is a field.', k: 'Field → Record → Table → Database' },
  { h: 'Keys', b: 'A primary key identifies each record uniquely. A foreign key points to the primary key of another table, which links the tables.' }
], [
  mcq('A primary key must be:', 'Unique and not null', ['Repeated across rows', 'Text only', 'Optional'], 'It identifies each record uniquely, so it cannot repeat or be empty.'),
  mcq('A foreign key is used to:', 'Link a table to the primary key of another table', ['Uniquely identify rows in its own table', 'Encrypt the data', 'Sort the records'], 'It holds a value that matches a primary key elsewhere, creating a relationship.'),
  tf('In a table, a row is called a record and a column is called a field.', true, 'Records are rows; fields are columns.'),
  order('Put these in order from smallest to largest.', ['Field', 'Record', 'Table', 'Database'], 'Fields make up records, records make up tables and tables make up a database.')
])

];

// ───────────────────────────── WRITTEN PRACTICE ─────────────────────────────
// Structured / essay style. The student writes an answer, then reveals the
// marking points and ticks the ones they covered.
//   marks = how many points earn full marks, pts = all acceptable points
const WRITTEN = [
  { s: 'A', q: 'State two limitations of a trial balance.', marks: 2,
    pts: ['It does not reveal errors of omission', 'It does not reveal compensating errors', 'It does not reveal errors of principle', 'It does not reveal errors of original entry (wrong amount posted on both sides)'] },
  { s: 'A', q: 'Distinguish between capital expenditure and revenue expenditure.', marks: 2,
    pts: ['Capital expenditure buys or improves non-current assets (e.g. machinery)', 'Revenue expenditure covers day-to-day running costs (e.g. wages, rent)', 'Capital expenditure benefits several years; revenue expenditure benefits the current year'] },
  { s: 'B', q: 'State two advantages of a sole proprietorship.', marks: 2,
    pts: ['Easy and cheap to set up', 'Owner keeps all the profits', 'Quick decision making', 'Close contact with customers', 'Business affairs stay private'] },
  { s: 'B', q: 'State two functions of management and explain one of them.', marks: 3,
    pts: ['Names two of: planning, organising, directing, controlling', 'Explains planning as setting objectives and deciding how to achieve them', 'Or explains controlling as comparing actual results with plans and correcting differences'] },
  { s: 'E', q: 'Define opportunity cost and give one example.', marks: 2,
    pts: ['The value of the next best alternative given up', 'A suitable example, e.g. studying instead of working part-time'] },
  { s: 'E', q: 'State two factors that shift the supply curve to the right.', marks: 2,
    pts: ['Improved technology', 'Lower cost of raw materials or labour', 'Government subsidy', 'More firms entering the industry'] },
  { s: 'I', q: 'Give two differences between RAM and ROM.', marks: 2,
    pts: ['RAM is volatile; ROM is non-volatile', 'RAM is read/write; ROM is normally read-only', 'RAM holds running programs and data; ROM holds start-up instructions (BIOS)'] },
  { s: 'I', q: 'State two advantages of connecting computers in a network.', marks: 2,
    pts: ['Share hardware such as printers', 'Share files and data easily', 'Central backup and security', 'Communicate, e.g. through email or messaging'] }
];
