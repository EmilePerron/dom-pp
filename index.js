/*
  A lineage library for DOM nodes
  MIT License
  
  Copyright (c) 2020-2021 Amadou Ba, Sylvain Hallé
  Eckinox Média and Université du Québec à Chicoutimi
  
  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:
  
  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

/**
 * Imports
 */
require("data-tree");

/**
 * Evaluates a set of conditions on a DOM tree
 * @param root A DOM node corresponding to the root of the page
 * @param conditions A list of {@link Function}, each corresponding to a
 * Boolean condition to evaluate on the page.
 * @return An array of data trees corresponding to the explanation for
 * each condition that evaluates to <tt>false</tt>.
 */
function evaluateDom(root, conditions = [])
{
	var verdicts = [];
	for (var i = 0; i < conditions.length; i++)
	{
		var verdict = getVerdict(root, conditions[i]);
		if (verdict != null)
		{
			verdicts.push(verdict);
		}
	}
	return verdicts;
};

/**
 * Evaluates a single condition on a DOM tree. <strong>This is a stub for
 * testing purposes.</strong>
 * @param root A DOM node corresponding to the root of the page
 * @param conditions A {@link Function} that corresponds to a
 * Boolean condition to evaluate on the page.
 * @return A data tree explaining the violation of the condition if it
 * evaluates to <tt>false</tt>, and <tt>null</tt> if the condition is fulfilled.
 */
function getVerdict(root, condition)
{
	if (root == null)
	{
		return null;
	}
	// Create a "fake" data tree
	var tree = dataTree.create();
	var n1 = tree.insert({
		type: "OR"});
	var n2 = tree.insertToNode(n1, {
		type: "object",
	  part: ["width"],
	  subject: "body[1]/section[2]/div[1]"});
	var n3 = tree.insertToNode(n1, {
		type: "AND"});
	var n4 = tree.insertToNode(n3, {
		type: "object",
	  part: ["characters 2-10", "text"],
	  subject: "body[1]/div[2]"});
	var n5 = tree.insertToNode(n3, "OR");
	var n6 = tree.insertToNode(n5, {
		type: "object",
	  part: ["value of"],
	  subject: "constant 100"});
	var n7 = tree.insertToNode(n5, {
		type: "object",
	  part: ["width"],
	  subject: "body[1]/section[2]/div[1]"});
	var n8 = tree.insertToNode(n3, {
		type: "object",
	  part: ["width"],
	  subject: "body[1]/section[2]/div[1]"});
	return tree;
}

/**
 * Abstract class representing all functions that extract parts of an
 * object.
 */
class Designator
{
	/**
	 * Creates a new instance of designator.
	 */
	constructor()
	{
		// Nothing to do
	}

	/**
	 * Extracts the designator at the head of a composition. For designators that
	 * are atomic, returns the designator itself.
	 */
	head()
	{
		return this;
	}

	/**
	 * Extracts the designator made of the tail of a composition. For designators
	 * that are atomic, returns the special designator {@link Nothing}.
	 */
	tail() 
	{
		return new Nothing();
	}
}

/**
 * A special designator that designates "nothing".
 */
class Nothing extends Designator
{
	static instance = new Nothing();

	constructor()
	{
		super();
	}
	
	toString()
	{
		return "Nothing";
	}
}

/**
 * A special designator that designates all of an object.
 */
class All extends Designator
{
	static instance = new All();

	constructor()
	{
		super();
	}
	
	toString()
	{
		return "All";
	}
}

/**
 * Designator expressed as the composition of atomic designators.
 * @param Any number of designators
 */
class CompoundDesignator extends Designator
{
	constructor()
	{
		super();
		this.elements = [];
		for (var i = 0; i < arguments.length; i++)
		{
			this.add(arguments[i]);
		}
	}
	
	/**
	 * Adds a designator to the composition.
   	 * @param d The designator to add. If it is compound, each of its elements are
   	 * added individually. This helps keeping the compound designators "flat".
   	 */
	add(d)
	{
			if (d instanceof CompoundDesignator)
			{
					for (var j = 0; j < d.elements.length; j++)
					{
							this.elements.push(d.elements[j]);
					}
			}
			else
			{
					this.elements.push(d);
			}
	}
	
	/**
	 * Gets the size (number of atomic designators) contained in this composite
	 * designator.
	 * @return The number of atomic designators
	 */
	size()
	{
		return this.elements.length;
	}
	
	head()
	{
		if (this.elements.length == 0)
		{
			return new Nothing();
		}
		return this.elements[this.elements.length - 1];
	}
	
	tail()
	{
		if (this.elements.length == 0)
		{
			return new All();
		}
		if (this.elements.length == 1)
		{
			return this.elements[0];
		}
		var new_d = new CompoundDesignator();
		for (var i = 0; i < this.elements.length - 1; i++)
		{
			new_d.add(this.elements[i]);
		}
		return new_d;
	}
	
	toString()
	{
		var s = "";
		for (var i = 0; i < this.elements.length; i++)
		{
			if (i > 0)
			{
				s += " of ";
			}
			s += this.elements[i].toString();
		}
		return s;
	}
}

/**
 * Abstract class representing a function.
 */
class AbstractFunction
 {
	constructor()
	{
		// Nothing to do
	}

	/**
	 * Computes the return value of the function from its provided input
	 * arguments.
	 * @param arguments A variable number of input arguments
	 * @return The return value of the function
	 */
	evaluate()
	{
		// To be overridden by descendants
		return null;
	}

	/**
	 * Converts an arbitrary object into a {@link Function}.
	 * @param o The object to convert. If o is a function, it is returned as is.
	 * Otherwise, o is converted into a {@link ConstantFunction} that returns
	 * the {@link Value} lifted from o.
	 * @return The converted function
	 */
	lift(o) 
	{
		if (o instanceof AbstractFunction)
		{
			return o;
		}
		return ConstantFunction(Value.prototype.lift(o));
	}

	/**
	 * Binds a variable name to a specific value.
	 * @param variable The name of the variable
	 * @param value The value to bind this variable to
	 */
	setTo(variable, value) 
	{
		// To be overridden by descendants
	}

	/**
	 * Gets the arity of the function.
	 * @return The arity
	 */
	getArity()
	{
		return 0;
	}
}

/**
 * Atomic designator representing the return value of a function.
 */
class ReturnValue extends Designator
 {
	constructor()
	{
		super();
	}

	toString()
	{
		return "!";
	}
}

/**
 * Atomic designator representing one of the input arguments of a function.
 * @param index The index of the input argument
 */
class InputArgument extends Designator
{
	constructor(index)
	{
		super();

		/**
		 * The index of the input argument
		 */
		this.index = index;
	}

	toString()
	{
		return "@" + this.index;
	}
}

/**
 * Object produced by the call(this) to a function, and whose lineage
 * can be computed.
 */
class Value
{
	constructor()
	{
		// Nothing to do
	}

	/**
	 * Gets the concrete value carried by this Value object.
	 * @return The value
	 */
	getValue()
	{
		// To be overridden by descendants
		return null;
	}

	/**
	 * Queries the provenance of a value.
	 * @param type The type of lineage relationship
	 * @param d A designator representing the part of the object that is the
	 * subject of the query
	 * @param root The node to which the rsults of the query should be appended
	 * as children
	 * @param A factory to produce traceability nodes
	 * @return The list of terminal traceability nodes produced by this query
	 */
	query(type, d, root, factory)
	{
		// To be overridden by descendants
	}

	/**
	 * Converts an arbitrary object into a {@link Value}.
	 * @param o The object to convert. If o is a {@link Value}, it is returned as
	 * is. Otherwise, o is converted into a {@link ConstantValue} that returns o.
	 * @return The converted value
	 */
	lift(o)
	{
		if (o instanceof Value)
		{
			return o;
		}
		return ConstantValue(o);
	}
}

/**
 * Function that performs a direct computation on its input arguments. This is
 * opposed to a {@link ComposedFunction} that call(this)s other functions to produce
 * its return value.
 * @param arity The input arity of the function
 */
class AtomicFunction extends AbstractFunction
{
	constructor(arity)
	{
		super();

		/**
		 * The input arity of the function
		 */
		this.arity = arity;
	}

	evaluate()
	{
		var values = [];
		for (var i = 0; i < arguments.length; i++)
		{
			values[i] = Value.prototype.lift(arguments[i]);
		}
		return this.compute(values);
	}

	/**
	 * Computes the return value of the function from its input arguments.
	 * @param arguments A variable number of {@link Values}, whose number
	 * must match the input arity of the function.
	 * @return The resulting {@link Value}
	 */
	compute()
	{
		if (values.length != this.arity)
		{
			throw "Invalid number of arguments";
		}
		args = [];
		for (var i = 0; i < arguments.length; i++)
		{
			args[i] = arguments[i];
		}
		var o = getValue(args);
		if (o instanceof Value)
		{
			return o;
		}
		return AtomicFunctionReturnValue(o, arguments);
	}

	getValue()
	{
		// To be overridden by descendants
		return null;
	}
}

/**
 * Value obtained as the output produced by an atomic function call(this).
 */
class AtomicFunctionReturnValue extends Value
{
	/**
 	 * Creates a new value
 	 * @param arguments An output value followed by the function's input arguments
 	 */
	constructor()
	 {
		super();

		/**
		 * The output value produced by the function
		 */
		this.outputValue = arguments[0];

		/**
		 * The function's input arguments
		 */
		this.inputValue = [];
		for (var i = 1; i < arguments.length; i++)
		{
			this.inputvalue[i - 1] = arguments[i];
		}
	}

	getValue()
	{
		return this.outputValue;
	}

	toString()
	{
		return this.outputValue.toString();
	}
}

/**
 * Special type of value that always returns the same constant.
 * @param o The constant to return
 */
class ConstantValue extends Value
{
	constructor()
	{
		super();

		/**
		 * The value represented by this constant
		 */
		this.value = o;
	}

	getValue()
	{
		return this.value;
	}

	toString()
	{
		return this.value.toString();
	}	
}
/**
 * Atomic designator that points to the value of a constant.
 */
class ConstantDesignator extends Designator
{
	constructor()
	{
		super();
	}

	toString()
	{
		return "Value";
	}
}

/**
 * Manages the nodes of a designation and-or graph.
 * @param arguments An optional stack corresponding to the tracer's context.
 */
class Tracer
{
	constructor()
	{
		/**
		 * A map keeping trace of which designated objects already have nodes.
		 */
		this.nodes = new Map();
		
		/**
		 * The context in which the tracer operates (a stack).
		 */
		this.tracerContext = [];
		if (arguments.length == 1)
		{
			this.tracerContext = arguments[0];
		}
	}

	/**
	 * Gets a new instance of an object node.
	 * @param dob The designated object that will be contained inside the node
	 * @return The object node. If an object node already exists for this
	 * designated object, it is reused. Otherwise, a new object node is created.
	 */
	getObjectNode(dob)
	{
		if (map_contains(this.nodes, dob))
		{
			return map_get(this.nodes, dob);
		}
		var on = ConcreteObjectNode(dob);
		map_put(this.nodes, dob, on);
		return on;
	}

	/**
	 * Gets a new instance of an "and" node.
	 * @return A new "and" node
	 */
	getAndNode()
	{
		return AndNode();
	}

	/**
	 * Gets a new instance of an "or" node.
	 * @return A new "or" node
	 */
	getOrNode()
	{
		return OrNode();
	}

	/**
	 * Gets a new instance of an "unknown" node.
	 * @return A new "unknown" node
	 */
	getUnknownNode()
	{
		return UnknownNode();
	}
}

/**
 * Abstract object representing a generic node in an and-or lineage graph.
 */
class TraceabilityNode
{
	/**
	 * A counter for traceability node IDs.
 	*/
	static TN_ID_COUNTER = 0;

	constructor()
	{
		/**
		 * The node's unique ID
		 */
		this.id = TN_ID_COUNTER++;
		
		/**
		 * The node's children
		 */
		this.children = [];
	}

	/**
	 * Gets the node'is unique ID
	 * @return The node's ID
	 */
	getId = function()
	{
		return this.id;
	}

	/**
	 * Adds a child to the node
	 * @return The node to add
	 */
	addChild = function(n)
	{
		this.children.push(n);
	}
}

/**
 * An "and" node.
 */
class AndNode extends TraceabilityNode
{
	constructor()
	{
		super();
	}

	toString()
	{
		var indent = "";
		if (arguments.length == 1)
		{
				indent = arguments[0];
		}
		var s = "";
		s += indent + "^" + "\n";
		for (var i = 0; i < this.children.length; i++)
		{
			s += indent + this.children[i].toString(indent + " ");
		}
		return s;
	}

	addChild(n)
	{
		if (n instanceof AndNode)
		{
			for (var i = 0; i < n.children.length; i++)
			{
				this.children.push(n.children[i]);
			}
		}
		else
		{
			this.children.push(n);
		}
	}
}

/**
 * An "or" node.
 */
class OrNode extends TraceabilityNode
{
	constructor()
	{
		super();
	}

	toString()
	{
		var indent = "";
		if (arguments.length == 1)
		{
				indent = arguments[0];
		}
		var s = "";
		s += indent + "v" + "\n";
		for (var i = 0; i < this.children.length; i++)
		{
			s += indent + this.children[i].toString(indent + " ");
		}
		return s;
	}

	addChild(n)
	{
		if (n instanceof OrNode)
		{
			for (var i = 0; i < n.children.length; i++)
			{
				this.children.push(n.children[i]);
			}
		}
		else
		{
			this.children.push(n);
		}
	}
}

/**
 * An "unknown" node.
 */
class UnknownNode extends TraceabilityNode
{
	constructor()
	{
		super();
	}

	toString()
	{
		return "?";
	}
}

/**
 * Association between a designator, and object and an optional context.
 */
class DesignatedObject
{
	/**
	 * Creates a new designated object
 	 * @param designator The part of the object that is designated
 	 * @param object The object that is designated
	 * @param context The object's context
	 */
	constructor(designator, object, context)
	{
		/**
		 * The part of the object that is designated.
		 */
		this.designator = designator;
		
		/**
		 * The object that is designated.
		 */
		this.object = object;
		
		/**
		 * The object's context.
		 */
		if (arguments.length >= 3)
		{
			this.context = context;
		}
	}

	/**
	 * Retrieves the designator associated to an object.
	 * @return The designator
	 */
	getDesignator()
	{
		return this.designator;
	}

	/**
	 * Retrieves the object that is being designated.
	 * @return The object
	 */
	getObject()
	{
		return this.object;
	}

	/**
	 * Retrieves the object's context.
	 * @return The context
	 */
	getContext()
	{
		return this.context;
	}

	equals(cdo)
	{
		if (cdo == null || !(cdo instanceof DesignatedObject))
		{
			return false;
		}
		return (this.object == null && cdo.object == null)
			|| (this.object != null && this.object.equals(cdo.object)
					&& this.designator.equals(cdo.designator) && sameContext(cdo));
	}

	/**
	 * Checks if two designated objects have the same context.
	 * @param cdo The other designated object
	 * @return <tt>true</tt> if the two objects have the same context,
	 * <tt>false</tt> otherwise
	 */
	sameContext(cdo)
	{
		if (this.context.length != cdo.context.length)
		{
			return false;
		}
		for (var i = 0; i < this.context.length; i++)
		{
			if (this.context[i] != cdo.context[i])
			{
				return false;
			}
		}
		return true;
	}
}

function map_get(m, k)
{
	for (const [key, value] of m)
	{
		if (key.equals(k))
		{
			return value;
		}
	}
	return null;
}

function map_contains(m, k)
{
	for (const [key, value] of m)
	{
		if (key.equals(k))
		{
			return true;
		}
	}
	return false;
}

function map_put(m, k, v)
{
	for (const [key, value] of m)
	{
		if (key.equals(k))
		{
			map.set(key, v);
			return;
		}
	}
	map.set(k, v);
}

/**
 * Export public API
 */
module.exports = 
{
		evaluateDom,
		All,
		CompoundDesignator,
		Nothing,
		Tracer
};
// :wrap=soft:tabSize=2: