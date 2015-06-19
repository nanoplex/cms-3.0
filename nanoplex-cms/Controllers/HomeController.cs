using System.Web.Mvc;
using cms;
using System.Threading.Tasks;
using MongoDB.Driver;

namespace nanoplex_cms.Controllers
{
    public class HomeController : Controller
    {
        [HttpGet]
        public ActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public async Task<string> Page(string id)
        {
            var query = await DatabaseContext.Pages.FindAsync(Builders<Page>.Filter.Eq(p => p.Name, id));

            var pages = await query.ToListAsync();

            if (pages.Count > 0)
            {
                return pages[0].toHTML();
            }
            else
            {
                return "error";
            }
        }
    }
}