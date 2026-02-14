import type { Plugin } from "../types";

export const DEFAULT_PLUGINS: Plugin[] = [
	{
		id: "go-std-lib",
		name: "Go Standard Library",
		version: "1.21",
		icon: "go",
		sections: [
			{
				id: "fmt",
				title: "Package fmt",
				content: `
          <h1 class="text-3xl font-bold mb-4">Package fmt</h1>
          <p class="mb-4">Package fmt implements formatted I/O with functions analogous to C's printf and scanf.</p>
          <h2 class="text-2xl font-semibold mt-6 mb-2">func Println</h2>
          <code class="bg-gray-100 dark:bg-gray-800 p-2 rounded block mb-4 whitespace-pre-wrap break-words">func Println(a ...any) (n int, err error)</code>
          <p>Println formats using the default formats for its operands and writes to standard output.</p>
        `,
			},
			{
				id: "net-http",
				title: "Package net/http",
				content: `
          <h1 class="text-3xl font-bold mb-4">Package http</h1>
          <p>Package http provides HTTP client and server implementations.</p>
          <div class="bg-blue-50 dark:bg-blue-900/30 p-4 rounded border-l-4 border-blue-500 my-4">
            <strong>Note:</strong> Get, Head, Post, and PostForm make HTTP (or HTTPS) requests.
          </div>
        `,
			},
		],
	},
	{
		id: "java-gradle",
		name: "Java & Gradle Guide",
		version: "8.4",
		icon: "java",
		sections: [
			{
				id: "gradle-basics",
				title: "Gradle Build Lifecycle",
				content: `
          <h1 class="text-3xl font-bold mb-4">Gradle Build Lifecycle</h1>
          <p class="mb-4">Gradle's core is a dependency based programming language.</p>
          <ul class="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Initialization:</strong> Gradle determines which projects are going to take part in the build.</li>
            <li><strong>Configuration:</strong> The project objects are configured.</li>
            <li><strong>Execution:</strong> Gradle determines the subset of the tasks to be executed.</li>
          </ul>
        `,
			},
			{
				id: "java-concurrency",
				title: "Java Concurrency",
				content: `
          <h1 class="text-3xl font-bold mb-4">Java Virtual Threads</h1>
          <p>Virtual threads are lightweight threads that dramatically reduce the effort of writing, maintaining, and observing high-throughput concurrent applications.</p>
          <pre class="bg-gray-900 text-gray-100 p-4 rounded mt-4 whitespace-pre-wrap break-words"><code>Thread.startVirtualThread(() -> {
    System.out.println("Hello from a virtual thread");
});</code></pre>
        `,
			},
		],
	},
	{
		id: "rust-std",
		name: "Rust Documentation",
		version: "1.75",
		icon: "rust",
		sections: [
			{
				id: "vec",
				title: "Struct std::vec::Vec",
				content: "<h1>Vec</h1><p>A contiguous growable array type.</p>",
			},
			{
				id: "option",
				title: "Enum std::option::Option",
				content:
					"<h1>Option</h1><p>Type Option represents an optional value.</p>",
			},
		],
	},
];
