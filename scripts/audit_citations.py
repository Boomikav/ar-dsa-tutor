import ast
import re

with open('scripts/build_ieee_paper.py', 'r', encoding='utf-8') as f:
    code = f.read()

tree = ast.parse(code)

paper_strings = []

class StringVisitor(ast.NodeVisitor):
    def visit_Call(self, node):
        func_name = ""
        if isinstance(node.func, ast.Name):
            func_name = node.func.id
        elif isinstance(node.func, ast.Attribute):
            func_name = node.func.attr
            
        if func_name in ['add_p', 'add_run', 'add_heading_1', 'add_heading_2', 'add_heading_5']:
            for arg in node.args:
                if isinstance(arg, ast.Constant) and isinstance(arg.value, str):
                    paper_strings.append((arg.value, node.lineno))
        self.generic_visit(node)

    def visit_Assign(self, node):
        # Also catch lit_data, bench_data, lat_data lists of strings
        for target in node.targets:
            if isinstance(target, ast.Name) and target.id in ['lit_data', 'bench_data', 'lat_data']:
                if isinstance(node.value, ast.List):
                    for elt in node.value.elts:
                        if isinstance(elt, ast.List):
                            for sub in elt.elts:
                                if isinstance(sub, ast.Constant) and isinstance(sub.value, str):
                                    paper_strings.append((sub.value, node.lineno))
        self.generic_visit(node)

visitor = StringVisitor()
visitor.visit(tree)

print(f"Collected {len(paper_strings)} string literals in paper content calls.")

citations_in_order = []
for text, lineno in paper_strings:
    # Stop before References section
    if "C. D. Hundhausen" in text:
        break
    matches = re.finditer(r'\[(\d+)\]', text)
    for m in matches:
        citations_in_order.append((int(m.group(1)), lineno, text[max(0, m.start()-20):min(len(text), m.end()+20)]))

seen = []
first_seen = {}
for num, line, snippet in citations_in_order:
    if num not in first_seen:
        first_seen[num] = (line, snippet)
        seen.append(num)

print(f"Total citations found in paper body: {len(citations_in_order)}")
print(f"Unique citation numbers: {sorted(seen)}")
print(f"First-appearance sequence: {seen}")

is_sequential = True
for idx, num in enumerate(seen):
    expected = idx + 1
    if num != expected:
        print(f"ERROR: Position {idx+1} has [{num}], but expected [{expected}]! First seen at line {first_seen[num][0]}: '{first_seen[num][1]}'")
        is_sequential = False

if is_sequential and len(seen) == 20:
    print("\nSUCCESS! Citations [1] through [20] are cited in EXACT sequential order (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20) with NO gaps or out-of-order occurrences!")
