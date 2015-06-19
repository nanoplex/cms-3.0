using cms;
using MongoDB.Driver;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace nanoplex_cms.Controllers
{
    public class AdminController : Controller
    {
        [HttpGet]
        public ActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public async Task<string> Pages()
        {
            var pages = await DatabaseContext.Pages.Find(Builders<Page>.Filter.Eq(p => p.Visible, true)).ToListAsync();

            var text = System.Web.Helpers.Json.Encode(pages);

            return text;
        }

        [HttpPost]
        public void DiscoverComponents()
        {
            var componentPath = "D:\\projects\\nanoplex-cms\\nanoplex-cms\\Components";
            var components = new List<Component>();
            var componentFolders = Directory.GetDirectories(componentPath);

            foreach (var path in componentFolders)
            {
                var name = Regex.Match(path, @"[\w-]+$").Value;
                var folder = Directory.EnumerateFiles(path).ToList();
                var jsonFile = folder.Where(f => f.EndsWith($"{name}.json"))?.First();

                if (jsonFile != null)
                {
                    jsonFile = System.IO.File.ReadAllText(jsonFile);

                    components.Add(new Component(name, jsonFile));
                }
            }

            Parallel.ForEach<Component>(components, c =>
            {
                var t = DatabaseContext.ComponentTypes.FindAsync(Builders<Component>.Filter.Eq(C => C.Id, c.Id));
                t.Wait();

                if (t.Result.Current == null)
                {
                    DatabaseContext.ComponentTypes.InsertOneAsync(c).Wait();
                }
            });
        }

        [HttpPost]
        public async Task PageName(string name, string value)
        {
            var query = DatabaseContext.Pages.FindAsync(Builders<Page>.Filter.Eq(p => p.Name, name));
            query.Wait();
            await query.Result.MoveNextAsync();
            var page = query.Result.Current.FirstOrDefault();
            if (page != null)
            {
                page.Name = value;

                await DatabaseContext.Pages.UpdateOneAsync(Builders<Page>.Filter.Eq(p => p.Name, name), Builders<Page>.Update.Set(p => p.Name, value));
            }
        }

        [HttpPost]
        public async Task PageDelete(string id)
        {
            await DatabaseContext.Pages.DeleteOneAsync(Builders<Page>.Filter.Eq(p => p.Name, id));
        }

        [HttpPost]
        public async Task PageAdd(string id)
        {
            var newOrder = DatabaseContext.Pages.FindAsync(Builders<Page>.Filter.Exists(p => p.Order, true));
            newOrder.Wait();

            await DatabaseContext.Pages.InsertOneAsync(new Page { Name = id, Visible = true });
        }
    }
}